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

import dcmjs from 'dcmjs';
import DicomValueRepresentations from '../../constants/DicomValueRepresentations';
import Logger from '../logging/Logger';

const { DicomMessage } = dcmjs.data;

export default class DicomFileInspector {

    /**
     * Parses a Dicom file. Extracts the UIDs that are supposed to be replaced in the de-identification step.
     * Additionally, it extracts all identifiers (vr is PN) if the data set is not already marked with patient identity removed.
     */
    constructor(fileObject, deIdentificationConfiguration, logger) {
        this.fileObject = fileObject;
        this.deIdentificationConfiguration = deIdentificationConfiguration;
        this.initializeLogger(logger);
        this.uids = [];

    }

    initializeLogger(logger) {
        if (logger != null) {
            this.log = logger;
        } else {
            this.log = new Logger(LogLevels.FATAL);
        }
    }

    async getBufferForTest() {
        return this.readDicomFile(this.fileObject);
    }

    async analyzeFile() {
        try {
            const reader = await this.__pFileReader(this.fileObject.fileObject);
            const arrayBuffer = reader.result;

            const parsingResult = this.readDicomFile(arrayBuffer);
            return parsingResult;
        } catch (e) {
            this.log.trace("DicomFileInspector.analyzeFile failed : " + e.toString());
        }

    }

    getUids() {
        return this.uids;
    }

    async __pFileReader(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);
            fileReader.onload = () => {
                resolve(fileReader);
            }
            fileReader.onerror = (error) => {
                this.log.trace("DicomFileInspector.__pFileReader  failed: " + error);
                reject(error);
            }
        });
    }

    readDicomFile(arrayBuffer) {

        const uidArray = [];
        const identities = [];
        const patientIdentities = [];
        let dataSet;

        try {
            dataSet = DicomMessage.readFile(arrayBuffer);
        } catch (e) {
            this.log.trace("DicomFileInspector.readDicomFile.readFile failed: " + e.toString());
        }
        try {
            let parsingResultMeta = this.parseDicomData(dataSet.meta);
            if (parsingResultMeta.uidArray) {
                uidArray.push(...parsingResultMeta.uidArray);
            }
        } catch (e) {
            this.log.trace("DicomFileInspector.readDicomFile.this.dataSet.meta failed: " + e.toString());
        } try {
            let parsingResult = this.parseDicomData(dataSet.dict);
            if (parsingResult.uidArray) {
                uidArray.push(...parsingResult.uidArray);
            }
            if (parsingResult.identities) {
                identities.push(...parsingResult.identities);
            }
            if (parsingResult.patientIdentities) {
                patientIdentities.push(...parsingResult.patientIdentities);
            }
        } catch (e) {
            this.log.trace("DicomFileInspector.readDicomFile failed: " + e.toString());
        }

        return {
            uidArray,
            identities,
            patientIdentities,
        };

    }

    parseDicomData(dataSetDict) {
        const uidArray = [];
        const identityRemoved = this.isPatientIdentityRemoved(dataSetDict);
        const identities = [];
        const patientIdentities = [];

        // Patient ID Attribute
        if (dataSetDict['00100010'] != undefined) {
            patientIdentities.push(dataSetDict['00100010']);
        }
        // Patient Name
        if (dataSetDict['00100020'] != undefined) {
            patientIdentities.push(dataSetDict['00100020']);
        }

        for (let propertyName in dataSetDict) {
            const element = dataSetDict[propertyName];

            if (element.vr) {
                const vr = element.vr;
                switch (vr) {
                    case DicomValueRepresentations.SQ:
                        for (let seqElement of element.Value) {
                            let parsingResult = this.parseDicomData(seqElement);
                            if (parsingResult.uidArray) {
                                uidArray.push(...parsingResult.uidArray);
                            }
                            if (parsingResult.identities) {
                                identities.push(...parsingResult.identities);
                            }
                            if (parsingResult.patientIdentities) {
                                patientIdentities.push(...parsingResult.patientIdentities);
                            }
                        }
                        break;

                    case DicomValueRepresentations.UI:
                        // filter just tags that are supposed to be replaced by configuration
                        if (this.deIdentificationConfiguration.isUidReplacementCandidate(propertyName)) {
                            if (Array.isArray(element.Value)) {
                                uidArray.push(...element.Value);
                            } else {
                                uidArray.push(element.Value);
                            }
                        }
                        break;

                    case DicomValueRepresentations.PN:

                        if (!identityRemoved) {
                            const value = element.Value;
                            // unwrap array value if there is just one item
                            if (Array.isArray(value)) {
                                identities.push(...value.filter(element => { return element != "" }));
                            } else {
                                if (value != "") {
                                    identities.push(value);
                                }
                            }
                        }

                        break;
                    default:
                        // console.log(`tag: ${propertyName} - value: ${element.Value}`)
                        break;
                }

            }

        }
        return {
            uidArray,
            identities: identities,
            patientIdentities: patientIdentities.filter(element => { return element !== "" }),
        };
    }

    isPatientIdentityRemoved(dataSetDict) {
        const element = dataSetDict['00120062'];
        if (element != undefined) {
            if (element.value === 'YES') {
                return true;
            }
        }
        return false;
    }

}