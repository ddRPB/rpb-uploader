/*
 * This file is part of RadPlanBio
 *
 * Copyright (C) 2013 - 2022 RPB Team
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import * as forge from "node-forge";
import promisePoller from "promise-poller";
import LogLevels from "../constants/LogLevels";
import MimeMessageBuilder from "../util/MimeMessageBuilder";
import DeIdentificationConfigurationFactory from "../util/deidentification/DeIdentificationConfigurationFactory";
import DicomFileDeIdentificationComponentDcmjs from "../util/deidentification/DicomFileDeIdentificationComponentDcmjs";
import Logger from "../util/logging/Logger";
import DicomFileInspector from "../util/verification/DicomFileInspector";
import DicomUploadChunk from "./DicomUploadChunk";

/**
 * Facade to handle the upload data and the different steps during the upload process.
 */
export default class DicomUploadPackage {
  /**
   * Facade to handle the upload data and the different steps during the upload process.
   */
  constructor(
    uploadSlot,
    logger = new Logger(LogLevels.FATAL),
    config = { chunkSize: 5, deIdentificationProfileOption: [] },
    mailService
  ) {
    this.mailService = mailService;
    this.setUploadSlotProperty(uploadSlot);

    this.initializeLogger(logger);

    this.selectedSeriesObjects = {};
    this.selectedFiles = [];
    this.uids = [];
    this.identityData = [];

    this.uploadChunks = [];

    this.pseudomizedFiles = [];
    this.uploadedFiles = [];
    this.verifiedFiles = [];

    this.studyInstanceUID = "";
    this.pseudonymizedStudyInstanceUID = "";

    this.apiKey = null;
    this.uploadServiceUrl = null;

    this.setChunkSize(config.chunkSize);

    this.configFactory = new DeIdentificationConfigurationFactory(config, this.uploadSlot);
    this.deIdentificationConfiguration = this.configFactory.getConfiguration();

    this.log.trace("De-identification configuration created.", {}, this.deIdentificationConfiguration);

    this.bindFunctionsToContext();

    this.delay = (ms) => new Promise((res) => setTimeout(res, ms));
  }

  /**
   * These functions can run within other components (via props) without loosing the context binding to the DicomUploadPackage.
   * Binding specifies the context (this) independent were the fuction is called.
   */
  bindFunctionsToContext() {
    // this.evaluateUploadOfSeries = this.evaluateUploadOfSeries.bind(this);
    this.verifySeriesUpload = this.verifySeriesUpload.bind(this);
  }

  /**
   * The chunk size defines how many Dicom files will be handeled/uploaded in one chunk.
   * The limit results mainly from the infrastructure, especialy proxies (e.g.: client_max_body_size in case of nginx).
   * If the chunk size is too big, the request will be rejected. With a small chunk size,
   * the count of requests is bigger and it will take longer to transfer the data.
   *
   */
  setChunkSize(chunkSize) {
    if (chunkSize != null) {
      this.log.trace(`DicomUploadPackage - set chunksize to ${chunkSize}.`);
      this.chunkSize = chunkSize;
    } else {
      this.log.trace(`DicomUploadPackage - set chunksize to default (5).`);
      this.chunkSize = 5;
    }
  }

  initializeLogger(logger) {
    if (logger != null) {
      this.log = logger;
    } else {
      this.log = new Logger(LogLevels.FATAL);
    }
  }

  setUploadSlotProperty(uploadSlot) {
    if (uploadSlot != null) {
      this.uploadSlot = uploadSlot;
    } else {
      this.uploadSlot = {};
    }
  }

  getSelectedSeries() {
    return this.selectedSeriesObjects;
  }

  setSelectedSeries(selectedSeriesObjects) {
    this.selectedSeriesObjects = selectedSeriesObjects;
    this.updateSelectedFilesArray(selectedSeriesObjects);
  }

  setStudyInstanceUID(studyInstanceUID) {
    this.studyInstanceUID = studyInstanceUID;
  }

  updateSelectedFilesArray(selectedSeriesObjects) {
    this.selectedFiles = [];
    for (let uid in selectedSeriesObjects) {
      const selectedSeries = selectedSeriesObjects[uid];
      selectedSeries.instances.forEach((value, key, map) => {
        this.selectedFiles.push(value.fileObject);
      });
    }
  }

  getSelectedFiles() {
    return this.selectedFiles;
  }

  getUids() {
    return this.uids;
  }

  getSelectedFilesCount() {
    if (this.selectedSeriesObjects === null) {
      return 0;
    }
    if (this.selectedSeriesObjects.length === 0) {
      return 0;
    }

    return this.selectedFiles.length;
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  setUploadServiceUrl(uploadServiceUrl) {
    this.uploadServiceUrl = uploadServiceUrl;
  }

  resetUploadProcess() {
    this.uploadChunks = [];

    this.pseudomizedFiles = [];
    this.uploadedFiles = [];
    this.verifiedFiles = [];

    this.pseudonymizedStudyInstanceUID = "";

    // ToDo: cancel linking
  }

  /**
   * Prepares the data set for the upload. Splits the data into chunks.
   * Extract the UID that needs to be replaced and tags that consist of potential identity information.
   * Errors will be propagated back.
   */
  async prepareUpload(setAnalysedFilesCountValue) {
    const uids = [];
    const identityData = [];
    const patientIdentityData = [];
    const errors = [];
    let processedFilesCount = 0;

    this.uploadChunks = [];

    for (let seriesUid in this.selectedSeriesObjects) {
      try {
        const selectedSeries = this.selectedSeriesObjects[seriesUid];
        this.log.trace("Prepare upload for series", {}, { seriesUid: seriesUid });

        if (selectedSeries.parameters != null) {
          let currentChunk = new DicomUploadChunk(this.studyInstanceUID, seriesUid);

          for (let sopInstanceUid of selectedSeries.instances.keys()) {
            this.log.trace("Prepare upload for instance", {}, { sopInstanceUid });

            const fileObject = selectedSeries.instances.get(sopInstanceUid);
            let uidArray = [];
            let identities = [];
            let patientIdentities = [];

            try {
              const inspector = new DicomFileInspector(fileObject, this.deIdentificationConfiguration, this.log);
              ({ uidArray, identities, patientIdentities } = await inspector.analyzeFile());
            } catch (e) {
              const message = "There was a problem during analysis of the DICOM file.";
              const data = { error: e, sopInstanceUid, fileObject };
              this.log.debug(message, {}, data);
              errors.push({ message, data });
            }

            uids.push(...uidArray);
            identityData.push(...identities);
            patientIdentityData.push(...patientIdentities);

            // create new chunk if necessary
            if (currentChunk.getCount() < this.chunkSize) {
              currentChunk.addInstance(sopInstanceUid, fileObject);
            } else {
              this.uploadChunks.push(currentChunk);
              currentChunk = new DicomUploadChunk(this.studyInstanceUID, seriesUid);
              currentChunk.addInstance(sopInstanceUid, fileObject);
            }

            // update UI
            processedFilesCount++;
            if (processedFilesCount % 250 === 0) {
              setAnalysedFilesCountValue(processedFilesCount);
            }
          }

          if (currentChunk.getCount() > 0) {
            this.uploadChunks.push(currentChunk);
          }
        }
      } catch (e) {
        const message = "There was a proplem preparing the upload of the series.";
        const data = { seriesUid, error: e };

        this.log.trace(message, {}, data);
        errors.push({ message, data });

        return {
          // Stop on first error
          errors: errors,
        };
      }
    }

    setAnalysedFilesCountValue(processedFilesCount);
    // this.identityData = Array.from(new Set(identityData));

    return {
      uids: Array.from(new Set(uids)),
      identities: Array.from(new Set(identityData)),
      patientIdentityData: Array.from(new Set(patientIdentityData)),
      errors: errors,
    };
  }

  /**
   * Promise of a REST call to the dicomweb studies service
   * @param {*} args Argument of the REST call
   * @returns promise that consists of the response
   */
  async performUploadPostRequest(args) {
    return fetch(`${this.uploadServiceUrl}/api/v1/dicomweb/studies/${this.pseudonymizedStudyInstanceUID}`, args);
  }

  /**
   * Sets the internal logic if the chunk upload was successful (response status = 200)
   * @param {*} chunk Internal representation of the chunk
   * @param {*} processedChunksCount Int count of processed chunks
   * @param {*} setUploadedFilesCountValue function that changes the overall uploaded file counter
   * @param {*} data meta data of the chunk
   * @returns
   */
  handleUploadSuccessForChunk(chunk, processedChunksCount, setUploadedFilesCountValue, data) {
    chunk.transfered = true;
    this.uploadedFiles = this.uploadedFiles.concat(chunk.getFileNames());

    const uploadedFilesCount = this.uploadedFiles.length;
    if (
      processedChunksCount === 1 ||
      processedChunksCount % 10 == 0 ||
      processedChunksCount > this.uploadChunks.length - 5
    ) {
      setUploadedFilesCountValue(uploadedFilesCount);
    }

    chunk.cleanupAfterTransfer();
    this.log.trace("Upload of chunk was successful", {}, data);
    return;
  }

  /**
   * De-identifies the data, based on the provided configuration and uploads the de-identified data to the RPB backend.
   */
  async deidentifyAndUpload(
    dicomUidReplacements,
    patientIdentityData,
    setDeIdentifiedFilesCountValue,
    setUploadedFilesCountValue
  ) {
    let errors = [];

    const pseudonymizedStudyUID = dicomUidReplacements.get(this.studyInstanceUID);
    if (pseudonymizedStudyUID != null) {
      this.pseudonymizedStudyInstanceUID = pseudonymizedStudyUID;
    }

    // StudyComments tag is used for XNAT handling
    const md5HashStudyInstanceUID = this.createMdFiveHashFromPseudonymizedStudyInstanceUID();
    this.addStudyCommentTagReplacement(md5HashStudyInstanceUID);

    let processedChunksCount = 0;

    for (let chunk of this.uploadChunks) {
      processedChunksCount++;

      this.log.trace(
        "Start de-identification of chunk",
        {},
        {
          studyUid: chunk.originalStudyUid,
          seriesUid: chunk.originalSeriesUid,
          files: chunk.getFilePathsAsString(),
        }
      );

      const boundary = "XXXXXXXX---abcd";
      const contentDescription = "description";
      const mimeMessageBuilder = new MimeMessageBuilder(boundary);

      if (!chunk.deIdentified) {
        try {
          chunk.setDeIdentifiedStudyUid(this.pseudonymizedStudyInstanceUID);
          chunk.setDeIdentifiedSeriesUid(dicomUidReplacements.get(chunk.originalSeriesUid));

          this.log.trace(
            "Start de-identification of chunk.",
            {},
            {
              seriesUid: chunk.originalSeriesUid,
              fileNames: chunk.getFilePathsAsString(),
            }
          );

          chunk.deidentifiedInstances = [];
          for (let instance of chunk.originalInstances) {
            this.log.trace("De-identify instance.", {}, { sopInstanceUid: instance.sopInstanceUid });

            const dicomFileDeIdentificationComponent = new DicomFileDeIdentificationComponentDcmjs(
              dicomUidReplacements,
              patientIdentityData,
              this.configFactory,
              instance.fileObject,
              this.log
            );
            const arrayBuffer = await dicomFileDeIdentificationComponent.getDeIdentifiedFileContentAsBuffer();
            this.log.trace("File buffer created", {}, { sopInstanceUid: instance.sopInstanceUid });
            const sopInstanceUidReplacement = dicomUidReplacements.get(instance.sopInstanceUid);

            chunk.deidentifiedInstances.push({
              sopInstanceUid: sopInstanceUidReplacement,
              fileObject: arrayBuffer,
            });

            this.log.trace("Instance de-identified", {}, { sopInstanceUid: instance.sopInstanceUid });

            mimeMessageBuilder.addDicomContent(
              Buffer.from(arrayBuffer.buffer),
              arrayBuffer.name,
              sopInstanceUidReplacement,
              contentDescription
            );
          }

          this.log.trace(
            "Chunk de-identified",
            {},
            {
              studyUid: chunk.originalStudyUid,
              seriesUid: chunk.originalSeriesUid,
              files: chunk.getFilePathsAsString(),
            }
          );

          chunk.deIdentified = true;
          this.pseudomizedFiles = this.pseudomizedFiles.concat(chunk.getFileNames());
          chunk.mimeMessage = mimeMessageBuilder.build();
        } catch (error) {
          const message = "There was a problem within the de-identification: " + error.toString();
          const data = {
            studyUid: chunk.originalStudyUid,
            seriesUid: chunk.originalSeriesUid,
            files: chunk.getFilePathsAsString(),
            error: error.toString(),
          };
          this.log.debug(message, {}, data);
          errors.push({ message, data });
          return {
            errors: errors,
          };
        }
      } else {
        this.log.trace("Chunk is already de-identified - skip this step", {}, {});
      }

      if (!chunk.transfered && this.apiKey != null && this.uploadServiceUrl != null) {
        this.log.trace(
          "Start upload of chunk",
          {},
          {
            studyUid: chunk.originalStudyUid,
            seriesUid: chunk.originalSeriesUid,
            files: chunk.getFilePathsAsString(),
          }
        );

        const args = {
          method: "POST",
          body: chunk.mimeMessage,
          headers: {
            "X-Api-Key": this.apiKey,
            "Content-Type": `multipart/related; boundary=${boundary}; type="application/dicom"`,
          },
        };

        try {
          let response = await this.performUploadPostRequest(args);

          const data = {
            studyUid: chunk.originalStudyUid,
            seriesUid: chunk.originalSeriesUid,
            files: chunk.getFilePathsAsString(),
            response,
          };
          switch (response.status) {
            case 200:
              this.handleUploadSuccessForChunk(chunk, processedChunksCount, setUploadedFilesCountValue, data);
              break;
            case 502:
              this.log.debug("Chunk upload failed with 502. Retry with a short delay", {}, data);
              await this.delay(5000);
              const secondResponse = await this.performUploadPostRequest(args);
              if (secondResponse.status == 200) {
                this.handleUploadSuccessForChunk(chunk, processedChunksCount, setUploadedFilesCountValue, data);
                this.log.debug("Retry status == 200", {}, data);
              } else {
                this.log.debug("Chunk upload retry failed with status: " + secondResponse.status, {}, data);
                errors.push({ message: "Chunk upload failed with status: " + response.status, data });
                errors.push({ message: "Second chunk upload failed with status: " + secondResponse.status, data });
                return { errors: errors };
              }
              break;
            case 413:
              this.log.debug(
                "Chunk upload failed. The payload is too large. Consider reducing the chunk size.",
                {},
                data
              );
              errors.push({
                message: "Chunk upload failed. The payload is too large. Consider reducing the chunk size.",
                data,
              });
              return { errors: errors };
            default:
              this.log.debug("Chunk upload failed with status: " + response.status, {}, data);
              errors.push({ message: "Chunk upload failed with status: " + response.status, data });
              return { errors: errors };
          }
        } catch (error) {
          const data = {
            studyUid: chunk.originalStudyUid,
            seriesUid: chunk.originalSeriesUid,
            files: chunk.getFilePathsAsString(),
            error,
          };
          this.log.debug("Chunk upload process failed", {}, data);
          errors.push({ message: "Chunk upload process failed", data });
          return { errors: errors };
        }
      }
    }
    return { errors };
  }

  /**
   * The study comment tag (0032,4000) is used for XNAT intergration.
   * The function prepares the addtionalTagValuesMap with an replacement String.
   */
  addStudyCommentTagReplacement(md5HashStudyInstanceUID) {
    const siteIdentifier = this.uploadSlot.siteIdentifier;
    const pid = this.uploadSlot.pid;
    const edcCode = this.uploadSlot.studyEdcCode;
    const studySubjectID = this.uploadSlot.subjectId;
    const studyCommentsReplacementArray = [];
    studyCommentsReplacementArray.push("Project:" + siteIdentifier);
    studyCommentsReplacementArray.push("Subject:" + pid);
    studyCommentsReplacementArray.push("Session:" + edcCode + "_" + studySubjectID + "_" + md5HashStudyInstanceUID);
    this.configFactory.additionalTagValuesMap.set("00324000", studyCommentsReplacementArray.join(" "));
  }

  /**
   * Creates an MD5 hash that is converted to an String representation of a decimal number.
   */
  createMdFiveHashFromPseudonymizedStudyInstanceUID() {
    if (this.pseudonymizedStudyInstanceUID === "") {
      this.log.error(
        "Creating MD5 hash from pseudonymized DicomStudyUID failed - pseudonymized DicomStudyUID is an empty String"
      );
      return "";
    }

    const md = forge.md.md5.create();
    md.update(this.pseudonymizedStudyInstanceUID);
    const md5HashStudyInstanceUID = BigInt("0x" + md.digest().toHex()).toString(10);
    this.log.trace(
      "Create MD5 hash from pseudonymized DicomStudyUID: " +
        this.pseudonymizedStudyInstanceUID +
        " -> " +
        md5HashStudyInstanceUID
    );
    return md5HashStudyInstanceUID;
  }

  /**
   * Verifies that the uploaded DICOM data passed the backend and are available there.
   * A polling mechanism allows to wait until the process has been finished.
   */
  async verifySeriesUpload(
    dicomUidReplacements,
    setVerifiedUploadedFilesCountValue,
    setSkippedVerificationFilesCountValue
  ) {
    this.log.trace("Start verification of series", {}, { dicomUidReplacements });

    let errors = [];
    let verifiedInstances = 0;
    let skippedInstances = 0;
    let verifiedUploads = [];
    let skippedUploadVerifications = [];

    for (let seriesUid in this.selectedSeriesObjects) {
      this.log.trace("Start upload verification of specific series", {}, { seriesUid });

      const selectedSeries = this.selectedSeriesObjects[seriesUid];
      const deIdentifiedSeriesUid = dicomUidReplacements.get(seriesUid);

      const data = {
        pid: this.uploadSlot.pid,
        studyUid: this.pseudonymizedStudyInstanceUID,
        seriesUid: deIdentifiedSeriesUid,
        instances: selectedSeries.getInstancesSize(),
      };

      if (selectedSeries.getInstancesSize() != null) {
        if (selectedSeries.skipVerification) {
          this.log.trace("Skip verification for the specific series", {}, data);
          skippedUploadVerifications.push(data);
          skippedInstances += selectedSeries.getInstancesSize();
          setSkippedVerificationFilesCountValue(skippedInstances);
        } else {
          this.log.trace("Query specific series", {}, data);
          try {
            //https://www.npmjs.com/package/promise-poller
            const interval = 5000;
            const timeout = 20000;
            const retries = 50;
            const pollTask = () =>
              this.evaluateUploadOfSeries(
                this.uploadSlot.pid,
                this.pseudonymizedStudyInstanceUID,
                deIdentifiedSeriesUid,
                selectedSeries.getInstancesSize()
              );

            let poller;

            poller = promisePoller({
              taskFn: pollTask,
              interval: interval,
              timeout: timeout,
              retries: retries,
            });

            const pollResult = await poller;

            data.pollResult = pollResult;
            this.log.trace("Query result for specific series", {}, data);
          } catch (e) {
            data.error = e;
            this.log.debug({ message: "Query for specific series failed", data });
            errors.push({
              message: "Query for series validation failed - please wait some seconds and push the retry button.",
              data,
            });
            return { errors: errors };
          }

          selectedSeries.setUploadVerified(true);
          verifiedInstances += selectedSeries.getInstancesSize();
          verifiedUploads.push(data);
          setVerifiedUploadedFilesCountValue(verifiedInstances);

          this.log.trace("DICOM upload verification for " + JSON.stringify(data));
        }
      }
    }

    if (skippedUploadVerifications.length > 0) {
      const skippedDicomVerificationSummaryString =
        "DICOM Upload verification skipped for upload slot: \n" +
        JSON.stringify(this.uploadSlot) +
        "\n  DICOM Series Details: \n" +
        JSON.stringify(skippedUploadVerifications);
      this.mailService.sendMail(skippedDicomVerificationSummaryString);
      this.log.trace("Skipped DICOM verification for " + JSON.stringify(skippedUploadVerifications));
    }

    if (verifiedUploads.length > 0) {
      const dicomVerificationSummaryString =
        "DICOM Upload verified for upload slot: \n" +
        JSON.stringify(this.uploadSlot) +
        "\n  DICOM Series Details: \n" +
        JSON.stringify(verifiedUploads);
      this.mailService.sendMail(dicomVerificationSummaryString);
    }

    return { errors: errors };
  }

  /**
   * Evaluates series upload promise.
   * Queries the backend for a specific series.
   */
  evaluateUploadOfSeries = async (pid, studyUid, seriesUid, expectedSize) =>
    new Promise(async (resolve, reject) => {
      this.log.trace("Run query for series promise.", {}, { pid, studyUid, seriesUid, expectedSize });

      const args = {
        method: "GET",
        headers: {
          "X-Api-Key": this.apiKey,
        },
      };

      try {
        const response = await fetch(
          `${this.uploadServiceUrl}/api/v1/pacs/subjects/${pid}/studies/${studyUid}/series/${seriesUid}`,
          args
        );

        if (response.status != 200) {
          this.log.debug("Query for series promise failed.", {}, { pid, studyUid, seriesUid, expectedSize, response });
          reject(
            `There is a problem with the service ${this.uploadServiceUrl}. The response is: ${response.status}. Please try again.`
          );
        }

        let jsonResponse;
        try {
          jsonResponse = await response.json();
        } catch (error) {
          reject(
            `The service response is not valid JSON, there is a problem with the remote service ${this.uploadServiceUrl}.`
          );
        }

        if (jsonResponse.Series.length === 0) {
          this.log.trace(
            "Query for series promise succeed - but length is zero - backend data processing probably not finished.",
            {},
            { pid, studyUid, seriesUid, expectedSize, response }
          );
          reject("No results yet");
        } else if (jsonResponse.Series[0].Images.length < expectedSize) {
          this.log.trace(
            "Query for series promise succeed - but length does not fit - backend data processing probably not finished.",
            {},
            {
              pid,
              studyUid,
              seriesUid,
              expectedSize,
              currentSize: jsonResponse.Series[0].Images.length,
              response,
            }
          );
          reject("Not all series instances found yet.");
        }
      } catch (error) {
        this.log.debug(
          "Query for series promise failed with error.",
          {},
          { pid, studyUid, seriesUid, expectedSize, error }
        );
        reject(error);
      }

      resolve(true);
    });

  /**
   * The EDC system will refer to the Dicom Study via the Dicom Study UID.
   * This function will send the web service the information that will trigger that.
   */
  async linkUploadedStudy(setStudyIsLinked, dicomUidReplacements) {
    this.log.trace("Start linking the Dicom study with the EDC system.", {}, { uploadSlot: this.uploadSlot });

    let errors = [];

    const jsonBody = {
      dicomStudyInstanceItemOid: this.uploadSlot.studyInstanceItemOid,
      dicomStudyInstanceItemValue: dicomUidReplacements.get(this.studyInstanceUID),
      dicomPatientIdItemOid: this.uploadSlot.dicomPatientIdItemOid,
      dicomPatientIdItemValue: this.uploadSlot.pid,
      itemGroupOid: this.uploadSlot.itemGroupOid,
      formOid: this.uploadSlot.formOid,
      pid: this.uploadSlot.pid,
      patientId: this.uploadSlot.pid,
      studyIdentifier: this.uploadSlot.studyIdentifier,
      siteIdentifier: this.uploadSlot.siteIdentifier,
      studyEventOid: this.uploadSlot.eventOid,
      studyEventRepeatKey: this.uploadSlot.eventRepeatKey,
      subjectKey: this.uploadSlot.subjectKey,
      subjectId: this.uploadSlot.subjectId,
      studyOid: this.uploadSlot.studyOid,
    };

    const args = {
      method: "POST",
      headers: {
        "X-Api-Key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonBody),
    };

    let response = await fetch(`${this.uploadServiceUrl}/api/v1/edc/linkdicomstudy`, args);

    if (response.status === 200) {
      const result = await response.json();

      this.log.trace("Linking request succeed", {}, { response, jsonBody });
      setStudyIsLinked(true);
    } else {
      let result = null;
      try {
        result = await response.json();
      } catch (e) {
        // ignore - JSON response is not mandatory if the request failed
      }

      if (result != null) {
        const message =
          "Linking request failed with response status: " +
          response.status +
          " . The error message is: " +
          result.errors;
        this.log.trace(message, {}, { response, jsonBody, result });
        errors.push({ message, response, jsonBody, result });
      } else {
        this.log.trace(
          "Linking request failed with response status: " + response.status + ".",
          {},
          { response, jsonBody }
        );
        errors.push({
          message: "Linking request failed with response status: " + response.status + ".",
          response,
          jsonBody,
        });
      }
    }

    return {
      errors: errors,
    };
  }
}
