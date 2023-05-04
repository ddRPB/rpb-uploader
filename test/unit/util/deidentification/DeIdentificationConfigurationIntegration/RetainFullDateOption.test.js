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

import DeIdentificationProfileCodes from "../../../../../src/constants/dicomTerminologyDefinitions/DeIdentificationProfileCodes";
import DeIdentificationProfileCodesMeaning from "../../../../../src/constants/dicomTerminologyDefinitions/DeIdentificationProfileCodesMeaning";
import YesNoEnum from "../../../../../src/constants/dicomValueEnums/YesNoEnum";
import LongitudinalTemporalInformationModifiedAttribute from "../../../../../src/constants/LongitudinalTemporalInformationModifiedAttribute";
import DeIdentificationConfigurationFactory from "../../../../../src/util/deidentification/DeIdentificationConfigurationFactory";
import DicomFileDeIdentificationComponentDcmjs from "../../../../../src/util/deidentification/DicomFileDeIdentificationComponentDcmjs";
import DeIdentificationProfiles from "./../../../../../src/constants/DeIdentificationProfiles";
import DicomValueRepresentations from "./../../../../../src/constants/DicomValueRepresentations";
import { applyConfigAction } from "./../DeIdentificationConfigurationFactory.test";

describe("Retain Patient Characteristics Profile Integration Test", () => {
  const dummyPid = "dummyPid";
  const dummySubjectId = "dummy-subject-id";
  const dummyStudyEdcCode = "dummy-edc-code";

  const uploadSlot = {
    studyEdcCode: dummyStudyEdcCode,
    subjectId: dummySubjectId,
    pid: dummyPid,
  };

  const dummyPatientName = "dummyPatientName";
  const dummyPatientId = "dummyPatientId";
  const patientIdentityData = [
    { Value: dummyPatientName, vr: DicomValueRepresentations.PN },
    { Value: dummyPatientId, vr: DicomValueRepresentations.LO },
  ];

  const dicomUidReplacements = new Map();

  const profile = DeIdentificationProfiles.RETAIN_LONG_FULL_DATES;
  const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
  const deIdentConfig = factory.getConfiguration();

  const deIdentComponent = new DicomFileDeIdentificationComponentDcmjs(
    dicomUidReplacements,
    patientIdentityData,
    factory,
    null,
    null
  );

  const dummyItemValue = "dummyValue";
  const dummyItemValueAddition = "abc";

  let dictKeepCandidates = {
    "00080022": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "0008002A": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00080032": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00380020": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00380021": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00440004": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00440104": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00440105": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "04000562": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "300C0127": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0014407E": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00181203": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "0014407C": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "04000310": { Value: dummyItemValue, vr: DicomValueRepresentations.OB },
    "00080023": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00080033": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00080107": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00080106": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00181042": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00181043": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "0018A002": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "21000040": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "21000050": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00080025": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00080035": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "0040A121": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "0040A110": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00181200": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "0018700C": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00181012": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "0040A120": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00181202": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00189701": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "04000105": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00380030": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00380032": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00686226": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00189517": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00120087": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00120086": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00189804": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00404011": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0040A023": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "0040A024": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "0040A024": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "30080054": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00189074": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00340007": { Value: dummyItemValue, vr: DicomValueRepresentations.OB },
    "00189151": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00189623": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0016008D": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0072000A": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0040E004": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "003A0314": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00686270": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00080015": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00080012": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00080013": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00189919": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "30100085": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "3010004D": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "3010004C": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "300A0741": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "40080112": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "40080113": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "40080100": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "40080101": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "40080108": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "40080109": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00180035": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00180027": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00402004": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00402005": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "001021D0": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00203403": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00203405": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "30080056": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "0040A192": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "0040A032": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0040A033": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0040A193": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00080024": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00080034": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "300A0760": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0040A082": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00400250": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00404051": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00400251": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00400244": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00404050": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00400245": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00700082": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00700083": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00404052": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0044000B": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00181078": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00181072": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00181079": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00181073": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "300A073A": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0040A13A": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "300E0004": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "300E0005": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "300A0006": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "300A0007": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "30080162": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "30080164": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "30080166": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "30080168": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "0038001A": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0038001B": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "0038001C": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0038001D": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00400004": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00400005": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00404008": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00404010": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00400002": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00404005": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00400003": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00321000": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00321001": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00321010": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00321011": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00720061": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00720063": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0072006B": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00080021": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00080031": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "01000420": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0018936A": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "00189369": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "300A022C": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "300A022E": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00189516": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "30060008": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "30060009": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00321040": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00321041": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00321050": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00321051": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00080020": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00080030": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00320034": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00320035": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00320032": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "00320033": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00440010": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0040DB07": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0040DB06": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0040A122": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "0040A112": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00181201": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "0018700E": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00181014": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "00080201": { Value: dummyItemValue, vr: DicomValueRepresentations.SH },
    "30080024": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "30080025": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "30080250": { Value: dummyItemValue, vr: DicomValueRepresentations.DA },
    "30080251": { Value: dummyItemValue, vr: DicomValueRepresentations.TM },
    "300A0736": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    "0040A030": { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
  };

  test("Option ensures that the specific values will be keeped.", () => {
    for (let key of Object.keys(dictKeepCandidates)) {
      applyConfigAction(deIdentConfig, dictKeepCandidates, key, DicomValueRepresentations.DT);
      expect(dictKeepCandidates[key], `Value of ${key} should be keeped`).not.toBeUndefined();
      expect(dictKeepCandidates[key], `Value of ${key} should be keeped`).not.toBeUndefined();
      expect(dictKeepCandidates[key].Value, `Value of ${key} should be keeped`).toBe(dummyItemValue);
    }
  });

  test("Additional tags will indicate that the RETAIN_LONG_FULL_DATES profile was applied on the data set", () => {
    const profile = DeIdentificationProfiles.RETAIN_LONG_FULL_DATES;
    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
    factory.addAdditionalDeIdentificationRelatedTags();
    const deIdentConfig = factory.getConfiguration();

    // Patient Identity Removed Attribute
    expect(deIdentConfig.additionalTagValuesMap.get("00120062"), "Patient Identity removed - should be yes").toBe(
      YesNoEnum.YES
    );
    // De-identification Method Attribute
    expect(deIdentConfig.additionalTagValuesMap.get("00120063"), "addtional 00120063 tag").toBe(
      "Per DICOM PS 3.15 AnnexE. RPB-Uploader v1.0"
    );
    // De-identification Method Code Sequence Attribute
    const usedMethods = deIdentConfig.additionalTagValuesMap.get("00120064");
    expect(usedMethods.length, "Value should be 2.").toBe(2);
    const lastMethod = usedMethods[1];
    // Coding Scheme Designator Attribute
    expect(
      lastMethod["00080100"].Value,
      `00080100 - should be ${DeIdentificationProfileCodes.RETAIN_LONG_FULL_DATES}`
    ).toEqual([DeIdentificationProfileCodes.RETAIN_LONG_FULL_DATES]);
    expect(lastMethod["00080102"].Value, `00080102 - should be DCM`).toEqual(["DCM"]);
    expect(
      lastMethod["00080104"].Value,
      `00080104 - should be ${DeIdentificationProfileCodes.RETAIN_LONG_FULL_DATES}`
    ).toEqual([DeIdentificationProfileCodesMeaning.RETAIN_LONG_FULL_DATES]);
  });

  describe("Additional tags tests", () => {
    let dict = {};
    deIdentConfig.addAdditionalTags(dict);

    test("PatientIdentityRemoved is set to yes", () => {
      expect(dict["00120062"].Value).toStrictEqual([YesNoEnum.YES]);
    });
    test("LongitudinalTemporalInformationModified is set to unmodified", () => {
      expect(dict["00280303"].Value).toStrictEqual([LongitudinalTemporalInformationModifiedAttribute.UNMODIFIED]);
    });
  });
});
