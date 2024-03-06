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

import dcmjs from "dcmjs";
import DeIdentificationActionCodes from "../../constants/DeIdentificationActionCodes";
import LogLevels from "../../constants/LogLevels";
import Logger from "../logging/Logger";

const { DicomMessage } = dcmjs.data;

export default class DicomFileDeIdentificationComponentDcmjs {
  constructor(dicomUidReplacements, patientIdentityData, configFactory, fileObject, logger) {
    this.dicomUidReplacements = dicomUidReplacements;
    this.patientIdentityData = patientIdentityData;
    this.configFactory = configFactory;
    this.configuration = configFactory.getConfiguration();
    this.fileObject = fileObject;
    this.initializeLogger(logger);
  }

  initializeLogger(logger) {
    if (logger != null) {
      this.log = logger;
    } else {
      this.log = new Logger(LogLevels.FATAL);
    }
  }

  async getBufferForTest() {
    return this.deIdentDicomFile(this.fileObject);
  }

  async getDeIdentifiedFileContentAsBuffer() {
    this.log.trace("Start de-identification of file", {}, { name: this.fileObject.fileObject.name });
    const reader = await this.__pFileReader(this.fileObject.fileObject);

    const arrayBuffer = reader.result;
    this.log.trace("file content read", {}, { name: this.fileObject.fileObject.name });

    return {
      name: this.fileObject.fileObject.name,
      path: this.fileObject.fileObject.path,
      size: this.fileObject.fileObject.size,
      buffer: this.deIdentDicomFile(arrayBuffer),
    };
  }

  createPatientIdentityValueArray() {
    let identityDataArray = [];
    if (this.patientIdentityData != undefined) {
      for (let item of this.patientIdentityData) {
        if (item.Value != undefined) {
          if (Array.isArray(item.Value)) {
            identityDataArray = identityDataArray.concat(item.Value);
          } else {
            identityDataArray.push(item.Value);
          }
        }
      }
    }
    return identityDataArray;
  }

  __pFileReader(file) {
    return new Promise((resolve, reject) => {
      var fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = () => {
        resolve(fileReader);
      };
    });
  }

  deIdentDicomFile(arrayBuffer) {
    this.dataSet = DicomMessage.readFile(arrayBuffer);
    this.log.trace("DicomMessage file content read.", {}, { name: this.fileObject.fileObject.name });

    this.configuration = this.configFactory.getConfiguration(this.dataSet);

    this.applyDeIdentificationActions(this.dataSet.meta);
    this.log.trace("Meta section de-identified.", {}, { name: this.fileObject.fileObject.name });

    this.applyDeIdentificationActions(this.dataSet.dict);
    this.log.trace("Dict section de-identified.", {}, { name: this.fileObject.fileObject.name });

    this.configuration.addDefaultTagsIfNecessary(this.dataSet.dict);
    this.log.trace("Default tags added.", {}, { name: this.fileObject.fileObject.name });

    this.configuration.addAdditionalTags(this.dataSet.dict);
    this.log.trace("Replacement tags added.", {}, { name: this.fileObject.fileObject.name });

    return this.dataSet.write();
  }

  applyDeIdentificationActions(dataSetDict) {
    let action, parameter, actionCode;

    for (let propertyName in dataSetDict) {
      const element = dataSetDict[propertyName];

      if (element.vr) {
        const vr = element.vr;
        switch (vr) {
          // Sequences
          case "SQ":
            ({ action, parameter, actionCode } = this.configuration.getTask(propertyName, vr));
            if (actionCode === undefined || actionCode === "not defined") {
              // recursion for all elements of the sequence
              for (let seqElement of element.Value) {
                this.applyDeIdentificationActions(seqElement);
              }
            } else {
              switch (actionCode) {
                // specific recursion for cleaning - need to iterate to all children
                case DeIdentificationActionCodes.C:
                  parameter = this.createPatientIdentityValueArray();
                  for (let seqElement of element.Value) {
                    this.handleRecursiveDeIdentificationAction(seqElement, action, parameter);
                  }
                  break;
                case DeIdentificationActionCodes.X:
                  try {
                    action(dataSetDict, propertyName, parameter);
                  } catch (error) {
                    this.log.warn(`Failed to apply action ${action} to ${propertyName}.`, {}, error);
                  }
                  break;

                default:
                  break;
              }
            }
            break;
          // all others (no sequence)
          default:
            ({ action, parameter, actionCode } = this.configuration.getTask(propertyName, vr));

            // overwrite parameter for UID replacements
            if (vr === "UI") parameter = this.dicomUidReplacements;
            // overwrite parameter for cleaning
            if (actionCode === DeIdentificationActionCodes.C) parameter = this.createPatientIdentityValueArray();

            try {
              action(dataSetDict, propertyName, parameter);
            } catch (error) {
              this.log.warn(`Failed to apply action ${action} to ${propertyName}.`, {}, error);
            }

            break;
        }
      }
    }
  }

  handleRecursiveDeIdentificationAction(dataSetDict, action, parameter) {
    for (let key of Object.keys(dataSetDict)) {
      const element = dataSetDict[key];
      const vr = element.vr;

      if (vr === "SQ") {
        for (let seqElement of element.Value) {
          this.handleRecursiveDeIdentificationAction(seqElement, action, parameter);
        }
      } else {
        try {
          action(dataSetDict, key, parameter);
        } catch (error) {
          this.log.warn(`Failed to apply action ${action} to ${key}.`, {}, error);
        }
      }
    }
  }
}
