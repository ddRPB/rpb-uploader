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

import DeIdentificationActionCodes from "../../constants/DeIdentificationActionCodes";
import DeIdentificationProfiles from "../../constants/DeIdentificationProfiles";
import DeIdentificationProfileCodes from "../../constants/dicomTerminologyDefinitions/DeIdentificationProfileCodes";
import DeIdentificationProfileCodesMeaning from "../../constants/dicomTerminologyDefinitions/DeIdentificationProfileCodesMeaning";
import YesNoEnum from "../../constants/dicomValueEnums/YesNoEnum";
import DicomValueRepresentations from "../../constants/DicomValueRepresentations";
import LongitudinalTemporalInformationModifiedAttribute from "../../constants/LongitudinalTemporalInformationModifiedAttribute";
import DeIdentificationConfiguration from "./DeIdentificationConfiguration";

// https://www.dicomstandard.org/News-dir/ftsup/docs/sups/sup142.pdf
// https://dicom.nema.org/medical/dicom/current/output/html/part15.html#table_E.1-1

/**
 * De-Identification helps to make use of patient data without exposing details that are not related to the research, 
 * for instance: the real patient name. The DICOM standard describes different possible profiles, based on that profiles 
 * actions are applied to a specific tag. This class allows to create a DeIdentificationConfiguration for a profile, 
 * specified in the constructor.
 * 
 * It is based on Supplement 142 from the DICOM standard with some RPB specific modifications and implementation details.
 */
export default class DeIdentificationConfigurationFactory {

    constructor(profileOptions, uploadSlot) {
        this.uploadSlot = uploadSlot;
        this.actionConfigurationMap = new Map();
        this.defaultReplacementsValuesMap = new Map();
        this.tagSpecificReplacementsValuesMap = new Map();
        this.additionalTagValuesMap = new Map();

        this.patientIdentitityRemoved = true; // true - current default setting
        this.longitudinalTemporalInformationModified = LongitudinalTemporalInformationModifiedAttribute.REMOVED; // true - current default setting
        this.rpbSpecificActions = false; // default - becomes true if the DeIdentificationProfiles.RPB_PROFILE is set
        this.appliedDeIdentificationSteps = [];

        this.createBasicProfile();
        this.createDefaultReplacementsValuesMap();
        this.createTagSpecificReplacementsValuesMap();

        this.applyProfileOptions(profileOptions);

        if (this.rpbSpecificActions) {
            this.uploadSlot.rpbSpecificActions = this.rpbSpecificActions;
            this.createRpbProfileActions();
            this.addTrialSubjectTags();
            this.addReferingPhysicianReplacementTag();
            this.addPatientNameAndIdReplacementTags();

        }

        this.addAdditionalDeIdentificationRelatedTags();
    }

    applyProfileOptions(profileOptions) {
        if (Array.isArray(profileOptions)) {
            for (let option of profileOptions) {
                this.applyOption(option);
            }
        } else {
            this.applyOption(profileOptions);
        }
    }

    applyOption(profileOptions) {
        switch (profileOptions) {
            case DeIdentificationProfiles.BASIC:
                //do nothing
                break;
            case DeIdentificationProfiles.RPB_PROFILE:
                this.rpbSpecificActions = true;
                break;
            case DeIdentificationProfiles.RETAIN_DEVICE_IDENTITY:
                this.createRetainDeviceIdentityOption();
                break;
            case DeIdentificationProfiles.RETAIN_PATIENT_CHARACTERISTICS:
                this.createRetainPatienCharacteristicsOption();
                break;
            case DeIdentificationProfiles.RETAIN_LONG_FULL_DATES:
                this.createRetainFullDatesOption();
                break;
            case DeIdentificationProfiles.CLEAN_STRUCTURED_CONTENT:
                this.createCleanStructuredContentOption();
                break;
            case DeIdentificationProfiles.CLEAN_DESCRIPTORS:
                this.createCleanDescriptorsOption();
                break;
            default:
                throw new Error(`Profile option "${profileOptions}" does not exist.`);
        }
    }

    createBasicProfile() {
        // annotation that the method is used
        this.appliedDeIdentificationSteps.push(
            {
                codeValue: DeIdentificationProfileCodes.BASIC,
                codeMeaning: DeIdentificationProfileCodesMeaning.BASIC
            });

        // Configure action codes
        // Accession Number 
        this.actionConfigurationMap.set('00080050', { action: DeIdentificationActionCodes.Z });
        // Acquisition Comments
        this.actionConfigurationMap.set('00184000', { action: DeIdentificationActionCodes.X });
        // Acquisition Context Sequence
        this.actionConfigurationMap.set('00400555', { action: DeIdentificationActionCodes.X });
        // Acquisition Date
        this.actionConfigurationMap.set('00080022', { action: DeIdentificationActionCodes.X });
        // Acquisition DateTime
        this.actionConfigurationMap.set('0008002A', { action: DeIdentificationActionCodes.X });
        // Acquisition Device Processing Description
        this.actionConfigurationMap.set('00181400', { action: DeIdentificationActionCodes.X });
        // Acquisition Protocol Description
        this.actionConfigurationMap.set('00189424', { action: DeIdentificationActionCodes.X });
        // Acquisition Time
        this.actionConfigurationMap.set('00080032', { action: DeIdentificationActionCodes.X });
        // Actual Human Performers Sequence
        this.actionConfigurationMap.set('00404035', { action: DeIdentificationActionCodes.X });
        // Additional Patientʼs History
        this.actionConfigurationMap.set('001021B0', { action: DeIdentificationActionCodes.X });
        // Admission ID
        this.actionConfigurationMap.set('00380010', { action: DeIdentificationActionCodes.X });
        // Admitting Date
        this.actionConfigurationMap.set('00380020', { action: DeIdentificationActionCodes.X });
        // Admitting Diagnoses Code Sequence
        this.actionConfigurationMap.set('00081084', { action: DeIdentificationActionCodes.X });
        // Admitting Diagnoses Description
        this.actionConfigurationMap.set('00081080', { action: DeIdentificationActionCodes.X });
        // Admitting Time
        this.actionConfigurationMap.set('00380021', { action: DeIdentificationActionCodes.X });
        // Affected SOP Instance UID
        this.actionConfigurationMap.set('00001000', { action: DeIdentificationActionCodes.X });
        // Allergies
        this.actionConfigurationMap.set('00102110', { action: DeIdentificationActionCodes.X });
        // Arbitrary 
        this.actionConfigurationMap.set('40000010', { action: DeIdentificationActionCodes.X });
        // Author Observer Sequence
        this.actionConfigurationMap.set('0040A078', { action: DeIdentificationActionCodes.X });
        // Branch of Service
        this.actionConfigurationMap.set('00101081', { action: DeIdentificationActionCodes.X });
        // Cassette ID
        this.actionConfigurationMap.set('00181007', { action: DeIdentificationActionCodes.X });
        // Comments on Performed Procedure Step
        this.actionConfigurationMap.set('00400280', { action: DeIdentificationActionCodes.X });
        // Concatenation UID
        this.actionConfigurationMap.set('00209161', { action: DeIdentificationActionCodes.U });
        // Confidentiality Constraint on Patient Data Description
        this.actionConfigurationMap.set('00403001', { action: DeIdentificationActionCodes.X });
        // Content Creator`s Name
        this.actionConfigurationMap.set('00700084', { action: DeIdentificationActionCodes.Z });
        // Content Creator`s Identification Code Sequence
        this.actionConfigurationMap.set('00700086', { action: DeIdentificationActionCodes.X });
        // Content Date
        this.actionConfigurationMap.set('00080023', { action: DeIdentificationActionCodes.D });
        // Content Sequence
        this.actionConfigurationMap.set('0040A730', { action: DeIdentificationActionCodes.X });
        // Content Time
        this.actionConfigurationMap.set('00080033', { action: DeIdentificationActionCodes.D });
        // Context Group Extension Creator UID
        this.actionConfigurationMap.set('0008010D', { action: DeIdentificationActionCodes.U });
        // Contrast Bolus Agent
        this.actionConfigurationMap.set('00180010', { action: DeIdentificationActionCodes.D });
        // Contribution Description
        this.actionConfigurationMap.set('0018A003', { action: DeIdentificationActionCodes.X });
        // Coutry of Residence
        this.actionConfigurationMap.set('00102150', { action: DeIdentificationActionCodes.X });
        // Creator Version UID
        this.actionConfigurationMap.set('00089123', { action: DeIdentificationActionCodes.U });
        // Current Patient Location
        this.actionConfigurationMap.set('00380300', { action: DeIdentificationActionCodes.X });
        // Curve Data
        this.actionConfigurationMap.set('50xxxxxx', { action: DeIdentificationActionCodes.X });
        // Curve Date
        this.actionConfigurationMap.set('00080025', { action: DeIdentificationActionCodes.X });
        // Curve Time
        this.actionConfigurationMap.set('00080035', { action: DeIdentificationActionCodes.X });
        // Custodial Organization Sequence
        this.actionConfigurationMap.set('0040A07C', { action: DeIdentificationActionCodes.X });
        // Data Set Trailing Padding
        this.actionConfigurationMap.set('FFFCFFFC', { action: DeIdentificationActionCodes.X });
        // Derivation Description
        this.actionConfigurationMap.set('00082111', { action: DeIdentificationActionCodes.X });
        // Detector ID
        this.actionConfigurationMap.set('0018700A', { action: DeIdentificationActionCodes.X });
        // Device Serial Number
        this.actionConfigurationMap.set('00181000', { action: DeIdentificationActionCodes.D });
        // Device UID
        this.actionConfigurationMap.set('00181002', { action: DeIdentificationActionCodes.U });
        // Digital Signature UID
        this.actionConfigurationMap.set('04000100', { action: DeIdentificationActionCodes.X });
        // Digital Signatures Sequence
        this.actionConfigurationMap.set('FFFAFFFA', { action: DeIdentificationActionCodes.X });
        // Dimension Organization UID
        this.actionConfigurationMap.set('00209164', { action: DeIdentificationActionCodes.U });
        // Discharge Diagnosis Description
        this.actionConfigurationMap.set('00380040', { action: DeIdentificationActionCodes.X });
        // Distribution Address
        this.actionConfigurationMap.set('4008011A', { action: DeIdentificationActionCodes.X });
        // Distribution Name
        this.actionConfigurationMap.set('40080119', { action: DeIdentificationActionCodes.X });
        // Dose Reference UID
        this.actionConfigurationMap.set('300A0013', { action: DeIdentificationActionCodes.U });
        // Ethnic Group
        this.actionConfigurationMap.set('00102160', { action: DeIdentificationActionCodes.X });
        // Failed SOP Instance UID List
        this.actionConfigurationMap.set('00080058', { action: DeIdentificationActionCodes.U });
        // Fiducial UID
        this.actionConfigurationMap.set('0070031A', { action: DeIdentificationActionCodes.U });
        // Filler Order Number of Imaging Service Request
        this.actionConfigurationMap.set('00402017', { action: DeIdentificationActionCodes.Z });
        // Frame Comments
        this.actionConfigurationMap.set('00209158', { action: DeIdentificationActionCodes.X });
        // Frame of Reference UID
        this.actionConfigurationMap.set('00200052', { action: DeIdentificationActionCodes.U });
        // Gantry ID
        this.actionConfigurationMap.set('00181008', { action: DeIdentificationActionCodes.X });
        // Generator ID
        this.actionConfigurationMap.set('00181005', { action: DeIdentificationActionCodes.X });
        // Graphic Annotation Sequence
        this.actionConfigurationMap.set('00700001', { action: DeIdentificationActionCodes.D });
        // Human Performers Name
        this.actionConfigurationMap.set('00404037', { action: DeIdentificationActionCodes.X });
        // Human Performers Organization
        this.actionConfigurationMap.set('00404036', { action: DeIdentificationActionCodes.X });
        // Icon Image Sequence
        this.actionConfigurationMap.set('00880200', { action: DeIdentificationActionCodes.X });
        // Identifying Comments
        this.actionConfigurationMap.set('00084000', { action: DeIdentificationActionCodes.X });
        // Image Comments
        this.actionConfigurationMap.set('00204000', { action: DeIdentificationActionCodes.X });
        // Image Presentation Comments
        this.actionConfigurationMap.set('00284000', { action: DeIdentificationActionCodes.X });
        // Imaging Service Request Comments
        this.actionConfigurationMap.set('00402400', { action: DeIdentificationActionCodes.X });
        // Impressions
        this.actionConfigurationMap.set('40080300', { action: DeIdentificationActionCodes.X });
        // Instance Creator UID
        this.actionConfigurationMap.set('00080014', { action: DeIdentificationActionCodes.U });
        // Institution Address
        this.actionConfigurationMap.set('00080081', { action: DeIdentificationActionCodes.X });
        // Institution Code Sequence
        this.actionConfigurationMap.set('00080082', { action: DeIdentificationActionCodes.D });
        // Institution Name
        this.actionConfigurationMap.set('00080080', { action: DeIdentificationActionCodes.D });
        // Institutional Department Name
        this.actionConfigurationMap.set('00081040', { action: DeIdentificationActionCodes.X });
        // Insurance Plan Identification
        this.actionConfigurationMap.set('00101050', { action: DeIdentificationActionCodes.X });
        // Intended Recipients of Results Identification Sequence
        this.actionConfigurationMap.set('00401011', { action: DeIdentificationActionCodes.X });
        // Interpretation Approver Sequence
        this.actionConfigurationMap.set('40080111', { action: DeIdentificationActionCodes.X });
        // Interpretation Author
        this.actionConfigurationMap.set('4008010C', { action: DeIdentificationActionCodes.X });
        // Interpretation Diagnosis Description
        this.actionConfigurationMap.set('40080115', { action: DeIdentificationActionCodes.X });
        // Interpretation ID Issuer
        this.actionConfigurationMap.set('40080202', { action: DeIdentificationActionCodes.X });
        // Interpretation Recorder
        this.actionConfigurationMap.set('40080102', { action: DeIdentificationActionCodes.X });
        // Interpretation Text
        this.actionConfigurationMap.set('4008010B', { action: DeIdentificationActionCodes.X });
        // Interpretation Transcriber
        this.actionConfigurationMap.set('4008010A', { action: DeIdentificationActionCodes.X });
        // Irradiation Event UID
        this.actionConfigurationMap.set('00083010', { action: DeIdentificationActionCodes.U });
        // Issuer of Admission ID
        this.actionConfigurationMap.set('00380011', { action: DeIdentificationActionCodes.X });
        // Issuer of Patient ID
        this.actionConfigurationMap.set('00100021', { action: DeIdentificationActionCodes.X });
        // Issuer of Service Episode ID
        this.actionConfigurationMap.set('00380061', { action: DeIdentificationActionCodes.X });
        // Large Palette Color Lookup Table UID
        this.actionConfigurationMap.set('00281214', { action: DeIdentificationActionCodes.U });
        // Last Menstrual Date
        this.actionConfigurationMap.set('001021D0', { action: DeIdentificationActionCodes.X });
        // MAC
        this.actionConfigurationMap.set('04000404', { action: DeIdentificationActionCodes.X });
        // Media Storage SOP Instance UID
        this.actionConfigurationMap.set('00020003', { action: DeIdentificationActionCodes.U });
        // Medical Alerts
        this.actionConfigurationMap.set('00102000', { action: DeIdentificationActionCodes.X });
        // Medical Record Locator
        this.actionConfigurationMap.set('00101090', { action: DeIdentificationActionCodes.X });
        // Military Rank
        this.actionConfigurationMap.set('00101080', { action: DeIdentificationActionCodes.X });
        // Modified Attributes Sequence
        this.actionConfigurationMap.set('04000550', { action: DeIdentificationActionCodes.X });
        // Modified Image Description
        this.actionConfigurationMap.set('00203406', { action: DeIdentificationActionCodes.X });
        // Modifying Device ID
        this.actionConfigurationMap.set('00203401', { action: DeIdentificationActionCodes.X });
        // Modifying Device Manufacturer
        this.actionConfigurationMap.set('00203404', { action: DeIdentificationActionCodes.X });
        // Name of Physician(s) Reading Study
        this.actionConfigurationMap.set('00081060', { action: DeIdentificationActionCodes.X });
        // Names of Intended Recipient of Results
        this.actionConfigurationMap.set('00401010', { action: DeIdentificationActionCodes.X });
        // Occupation
        this.actionConfigurationMap.set('00102180', { action: DeIdentificationActionCodes.X });
        // Operatorsʼ Identification Sequence
        this.actionConfigurationMap.set('00081072', { action: DeIdentificationActionCodes.D });
        // Operatorsʼ Name
        this.actionConfigurationMap.set('00081070', { action: DeIdentificationActionCodes.D });
        // Original Attributes Sequence
        this.actionConfigurationMap.set('04000561', { action: DeIdentificationActionCodes.X });
        // Order Callback Phone Number
        this.actionConfigurationMap.set('00402010', { action: DeIdentificationActionCodes.X });
        // Order Entered By
        this.actionConfigurationMap.set('00402008', { action: DeIdentificationActionCodes.X });
        // Order Enterer Location
        this.actionConfigurationMap.set('00402009', { action: DeIdentificationActionCodes.X });
        // Other Patient IDs
        this.actionConfigurationMap.set('00101000', { action: DeIdentificationActionCodes.X });
        // Other Patient IDs Sequence
        this.actionConfigurationMap.set('00101002', { action: DeIdentificationActionCodes.X });
        // Other Patient Names
        this.actionConfigurationMap.set('00101001', { action: DeIdentificationActionCodes.X });
        // Overlay Comments
        this.actionConfigurationMap.set('60xx4000', { action: DeIdentificationActionCodes.X });
        // Overlay Data
        this.actionConfigurationMap.set('60xx3000', { action: DeIdentificationActionCodes.X });
        // Overlay Date
        this.actionConfigurationMap.set('00080024', { action: DeIdentificationActionCodes.X });
        // Overlay Time
        this.actionConfigurationMap.set('00080034', { action: DeIdentificationActionCodes.X });
        // Palette Color Lookup Table UID
        this.actionConfigurationMap.set('00281199', { action: DeIdentificationActionCodes.U });
        // Participant Sequence
        this.actionConfigurationMap.set('0040A07A', { action: DeIdentificationActionCodes.X });
        // Patient Address
        this.actionConfigurationMap.set('00101040', { action: DeIdentificationActionCodes.X });
        // Patient Comments
        this.actionConfigurationMap.set('00104000', { action: DeIdentificationActionCodes.X });
        // Patient ID
        this.actionConfigurationMap.set('00100020', { action: DeIdentificationActionCodes.Z });
        // Patient Sex Neutered
        this.actionConfigurationMap.set('00102203', { action: DeIdentificationActionCodes.D });
        // Patient State
        this.actionConfigurationMap.set('00380500', { action: DeIdentificationActionCodes.X });
        // Patient Transport Arrangements
        this.actionConfigurationMap.set('00401004', { action: DeIdentificationActionCodes.X });
        // Patientʼs Age
        this.actionConfigurationMap.set('00101010', { action: DeIdentificationActionCodes.X });
        // Patientʼs Birth Date
        this.actionConfigurationMap.set('00100030', { action: DeIdentificationActionCodes.Z });
        // Patientʼs Birth Name
        this.actionConfigurationMap.set('00101005', { action: DeIdentificationActionCodes.X });
        // Patientʼs Birth Time
        this.actionConfigurationMap.set('00100032', { action: DeIdentificationActionCodes.X });
        // Patientʼs Institution Reside 
        this.actionConfigurationMap.set('00380400', { action: DeIdentificationActionCodes.X });
        // Patientʼs Insurance Plan Code Sequence
        this.actionConfigurationMap.set('00100050', { action: DeIdentificationActionCodes.X });
        // Patientʼs Motherʼs Birth Name
        this.actionConfigurationMap.set('00101060', { action: DeIdentificationActionCodes.X });
        // Patientʼs Name
        this.actionConfigurationMap.set('00100010', { action: DeIdentificationActionCodes.Z });
        // Patientʼs Primary Language Code Sequence
        this.actionConfigurationMap.set('00100101', { action: DeIdentificationActionCodes.X });
        // Patientʼs Primary Language Modifier Code Sequence
        this.actionConfigurationMap.set('00100102', { action: DeIdentificationActionCodes.X });
        // Patientʼs Religious Preference
        this.actionConfigurationMap.set('001021F0', { action: DeIdentificationActionCodes.X });
        // Patientʼs Sex
        this.actionConfigurationMap.set('00100040', { action: DeIdentificationActionCodes.Z });
        // Patientʼs Size 
        this.actionConfigurationMap.set('00101020', { action: DeIdentificationActionCodes.X });
        // Patientʼs Telephone Number 
        this.actionConfigurationMap.set('00102154', { action: DeIdentificationActionCodes.X });
        // Patientʼs Weight
        this.actionConfigurationMap.set('00101030', { action: DeIdentificationActionCodes.X });
        // Performed Location
        this.actionConfigurationMap.set('00400243', { action: DeIdentificationActionCodes.X });
        // Performed Procedure Step Description
        this.actionConfigurationMap.set('00400254', { action: DeIdentificationActionCodes.X });
        // Performed Procedure Step ID
        this.actionConfigurationMap.set('00400253', { action: DeIdentificationActionCodes.X });
        // Performed Procedure Step Start Date
        this.actionConfigurationMap.set('00400244', { action: DeIdentificationActionCodes.X });
        // Performed Procedure Step Start Time
        this.actionConfigurationMap.set('00400245', { action: DeIdentificationActionCodes.X });
        // Performed Station AE Title
        this.actionConfigurationMap.set('00400241', { action: DeIdentificationActionCodes.X });
        // Performed Station Geographic Location Code Sequence
        this.actionConfigurationMap.set('00404030', { action: DeIdentificationActionCodes.X });
        // Performed Station Name
        this.actionConfigurationMap.set('00400242', { action: DeIdentificationActionCodes.X });
        // Performed Station Name Code Sequence
        this.actionConfigurationMap.set('00400248', { action: DeIdentificationActionCodes.X });
        // Performing Physiciansʼ Identification Sequence
        this.actionConfigurationMap.set('00081052', { action: DeIdentificationActionCodes.X });
        // Performing Physiciansʼ Name
        this.actionConfigurationMap.set('00081050', { action: DeIdentificationActionCodes.X });
        // Person Address
        this.actionConfigurationMap.set('00401102', { action: DeIdentificationActionCodes.X });
        // Person Identification Code Sequence
        this.actionConfigurationMap.set('00401101', { action: DeIdentificationActionCodes.D });
        // Person Name
        this.actionConfigurationMap.set('0040A123', { action: DeIdentificationActionCodes.D });
        // Person Telephone Numbers
        this.actionConfigurationMap.set('00401103', { action: DeIdentificationActionCodes.X });
        // Physician Approving Interpretation
        this.actionConfigurationMap.set('40080114', { action: DeIdentificationActionCodes.X });
        // Physician Reading Study Identification Sequence
        this.actionConfigurationMap.set('00081062', { action: DeIdentificationActionCodes.X });
        // Physician(s) of Record
        this.actionConfigurationMap.set('00081048', { action: DeIdentificationActionCodes.X });
        // Physician(s) of Record Identification Sequence
        this.actionConfigurationMap.set('00081049', { action: DeIdentificationActionCodes.X });
        // Placer Order Number of Imaging Service Request
        this.actionConfigurationMap.set('00402016', { action: DeIdentificationActionCodes.Z });
        // Plate ID
        this.actionConfigurationMap.set('00181004', { action: DeIdentificationActionCodes.X });
        // Pre-Medication
        this.actionConfigurationMap.set('00400012', { action: DeIdentificationActionCodes.X });
        // Pregnancy Status
        this.actionConfigurationMap.set('001021C0', { action: DeIdentificationActionCodes.X });
        // Private attributes
        this.actionConfigurationMap.set('private', { action: DeIdentificationActionCodes.X });
        // Protocol Name
        this.actionConfigurationMap.set('00181030', { action: DeIdentificationActionCodes.D });
        // Reason for Imaging Service Request
        this.actionConfigurationMap.set('00402001', { action: DeIdentificationActionCodes.X });
        // Reason for Study
        this.actionConfigurationMap.set('00321030', { action: DeIdentificationActionCodes.X });
        // Referenced Digital Signature Sequence
        this.actionConfigurationMap.set('04000402', { action: DeIdentificationActionCodes.X });
        // Referenced Frame of Reference UID
        this.actionConfigurationMap.set('30060024', { action: DeIdentificationActionCodes.U });
        // Referenced General Purpose Scheduled Procedure Step Transaction UID
        this.actionConfigurationMap.set('00404023', { action: DeIdentificationActionCodes.U });
        // Referenced Image Sequence
        this.actionConfigurationMap.set('00081140', { action: DeIdentificationActionCodes.U });
        // Referenced Patient Alias Sequence
        this.actionConfigurationMap.set('00381234', { action: DeIdentificationActionCodes.X });
        // Referenced Patient Sequence
        this.actionConfigurationMap.set('00081120', { action: DeIdentificationActionCodes.X });
        // Referenced Performed Procedure Step Sequence
        this.actionConfigurationMap.set('00081111', { action: DeIdentificationActionCodes.X });
        // Referenced SOP Instance MAC Sequence
        this.actionConfigurationMap.set('04000403', { action: DeIdentificationActionCodes.X });
        // Referenced SOP Instance UID
        this.actionConfigurationMap.set('00081155', { action: DeIdentificationActionCodes.U });
        // Referenced SOP Instance UID in File
        this.actionConfigurationMap.set('00041511', { action: DeIdentificationActionCodes.U });
        // Referenced Study Sequence
        this.actionConfigurationMap.set('00081110', { action: DeIdentificationActionCodes.X });
        // Referring Physicianʼs Address
        this.actionConfigurationMap.set('00080092', { action: DeIdentificationActionCodes.X });
        // Referring Physicianʼs Identification Sequence
        this.actionConfigurationMap.set('00080096', { action: DeIdentificationActionCodes.X });
        // Referring Physicianʼs Name
        this.actionConfigurationMap.set('00080090', { action: DeIdentificationActionCodes.Z });
        // Referring Physicianʼs Telephone Numbers
        this.actionConfigurationMap.set('00080094', { action: DeIdentificationActionCodes.X });
        // Region of Residence
        this.actionConfigurationMap.set('00102152', { action: DeIdentificationActionCodes.X });
        // Related Frame of Reference UID
        this.actionConfigurationMap.set('300600C2', { action: DeIdentificationActionCodes.U });
        // Request Attributes Sequence
        this.actionConfigurationMap.set('00400275', { action: DeIdentificationActionCodes.X });
        // Requested Contrast Agent
        this.actionConfigurationMap.set('00321070', { action: DeIdentificationActionCodes.X });
        // Requested Procedure Comments
        this.actionConfigurationMap.set('00401400', { action: DeIdentificationActionCodes.X });
        // Requested Procedure Descript 
        this.actionConfigurationMap.set('00321060', { action: DeIdentificationActionCodes.X });
        // Requested Procedure ID 
        this.actionConfigurationMap.set('00401001', { action: DeIdentificationActionCodes.X });
        // Requested Procedure Location 
        this.actionConfigurationMap.set('00401005', { action: DeIdentificationActionCodes.X });
        // Requested SOP Instance UID
        this.actionConfigurationMap.set('00001001', { action: DeIdentificationActionCodes.U });
        // Requesting Physician
        this.actionConfigurationMap.set('00321032', { action: DeIdentificationActionCodes.X });
        // Requesting Service
        this.actionConfigurationMap.set('00321033', { action: DeIdentificationActionCodes.X });
        // Responsible Organization
        this.actionConfigurationMap.set('00102299', { action: DeIdentificationActionCodes.X });
        // Responsible Person
        this.actionConfigurationMap.set('00102297', { action: DeIdentificationActionCodes.X });
        // Results Comments
        this.actionConfigurationMap.set('40084000', { action: DeIdentificationActionCodes.X });
        // Results Distribution List Sequence
        this.actionConfigurationMap.set('40080118', { action: DeIdentificationActionCodes.X });
        // Results ID Issuer
        this.actionConfigurationMap.set('300E0008', { action: DeIdentificationActionCodes.Z });
        // Scheduled Human Performers Sequence
        this.actionConfigurationMap.set('00404034', { action: DeIdentificationActionCodes.X });
        // Scheduled Patient Institution Residence
        this.actionConfigurationMap.set('0038001E', { action: DeIdentificationActionCodes.X });
        // Scheduled Performing Physician Identification Sequence
        this.actionConfigurationMap.set('0040000B', { action: DeIdentificationActionCodes.X });
        // Scheduled Performing Physician Name
        this.actionConfigurationMap.set('00400006', { action: DeIdentificationActionCodes.X });
        // Scheduled Procedure Step End Date 
        this.actionConfigurationMap.set('00400004', { action: DeIdentificationActionCodes.X });
        // Scheduled Procedure Step End Time 
        this.actionConfigurationMap.set('00400005', { action: DeIdentificationActionCodes.X });
        // Scheduled Procedure Step Description 
        this.actionConfigurationMap.set('00400007', { action: DeIdentificationActionCodes.X });
        // Scheduled Procedure Step Location
        this.actionConfigurationMap.set('00400011', { action: DeIdentificationActionCodes.X });
        // Scheduled Procedure Step Start Date
        this.actionConfigurationMap.set('00400002', { action: DeIdentificationActionCodes.X });
        // Scheduled Procedure Step Start Time
        this.actionConfigurationMap.set('00400003', { action: DeIdentificationActionCodes.X });
        // Scheduled Station AE Title
        this.actionConfigurationMap.set('00400001', { action: DeIdentificationActionCodes.X });
        // Scheduled Station Geographic Location Code Sequence
        this.actionConfigurationMap.set('00404027', { action: DeIdentificationActionCodes.X });
        // Scheduled Station Name
        this.actionConfigurationMap.set('00400010', { action: DeIdentificationActionCodes.X });
        // Scheduled Station Name Code Sequence
        this.actionConfigurationMap.set('00404025', { action: DeIdentificationActionCodes.X });
        // Scheduled Study Location
        this.actionConfigurationMap.set('00321020', { action: DeIdentificationActionCodes.X });
        // Scheduled Study Location AE Title
        this.actionConfigurationMap.set('00321021', { action: DeIdentificationActionCodes.X });
        // Series Date
        this.actionConfigurationMap.set('00080021', { action: DeIdentificationActionCodes.D });
        // Series Description
        this.actionConfigurationMap.set('0008103E', { action: DeIdentificationActionCodes.X });
        // Series Instance UID
        this.actionConfigurationMap.set('0020000E', { action: DeIdentificationActionCodes.U });
        // Series Time
        this.actionConfigurationMap.set('00080031', { action: DeIdentificationActionCodes.D });
        // Service Episode Description
        this.actionConfigurationMap.set('00380062', { action: DeIdentificationActionCodes.X });
        // Service Episode ID
        this.actionConfigurationMap.set('00380060', { action: DeIdentificationActionCodes.X });
        // Smoking Status
        this.actionConfigurationMap.set('001021A0', { action: DeIdentificationActionCodes.X });
        // SOP Instance UID
        this.actionConfigurationMap.set('00080018', { action: DeIdentificationActionCodes.U });
        // Source Image Sequence
        this.actionConfigurationMap.set('00082112', { action: DeIdentificationActionCodes.X });
        // Special Needs
        this.actionConfigurationMap.set('00380050', { action: DeIdentificationActionCodes.X });
        // Station Name
        this.actionConfigurationMap.set('00081010', { action: DeIdentificationActionCodes.D });
        // Storage Media Fileset UID
        this.actionConfigurationMap.set('00880140', { action: DeIdentificationActionCodes.U });
        // Study Comments
        this.actionConfigurationMap.set('00324000', { action: DeIdentificationActionCodes.X });
        // Study Date
        this.actionConfigurationMap.set('00080020', { action: DeIdentificationActionCodes.Z });
        // Study Description
        this.actionConfigurationMap.set('00081030', { action: DeIdentificationActionCodes.X });
        // Study ID
        this.actionConfigurationMap.set('00200010', { action: DeIdentificationActionCodes.Z });
        // Study ID Issuer
        this.actionConfigurationMap.set('00320012', { action: DeIdentificationActionCodes.X });
        // Study Instance UID
        this.actionConfigurationMap.set('0020000D', { action: DeIdentificationActionCodes.U });
        // Study Time
        this.actionConfigurationMap.set('00080030', { action: DeIdentificationActionCodes.Z });
        // Synchronization Frame of Reference UID
        this.actionConfigurationMap.set('00200200', { action: DeIdentificationActionCodes.U });
        // Template Extension Creator UID
        this.actionConfigurationMap.set('0040DB0D', { action: DeIdentificationActionCodes.U });
        // Template Extension Organization UID
        this.actionConfigurationMap.set('0040DB0C', { action: DeIdentificationActionCodes.U });
        // Text Comments
        this.actionConfigurationMap.set('40004000', { action: DeIdentificationActionCodes.X });
        // Text String
        this.actionConfigurationMap.set('20300020', { action: DeIdentificationActionCodes.X });
        // Timezone Offset From UTC 
        this.actionConfigurationMap.set('00080201', { action: DeIdentificationActionCodes.X });
        // Topic Author
        this.actionConfigurationMap.set('00880910', { action: DeIdentificationActionCodes.X });
        // Topic Key Words
        this.actionConfigurationMap.set('00880912', { action: DeIdentificationActionCodes.X });
        // Topic Subject 
        this.actionConfigurationMap.set('00880906', { action: DeIdentificationActionCodes.X });
        // Topic Title
        this.actionConfigurationMap.set('00880904', { action: DeIdentificationActionCodes.X });
        // Transaction UID
        this.actionConfigurationMap.set('00081195', { action: DeIdentificationActionCodes.U });
        // UID
        this.actionConfigurationMap.set('0040A124', { action: DeIdentificationActionCodes.U });
        // Verifying Observer Identification Code Sequence
        this.actionConfigurationMap.set('0040A088', { action: DeIdentificationActionCodes.Z });
        // Verifying Observer Name
        this.actionConfigurationMap.set('0040A075', { action: DeIdentificationActionCodes.D });
        // Verifying Observer Sequence
        this.actionConfigurationMap.set('0040A073', { action: DeIdentificationActionCodes.D });
        // Verifying Organization
        this.actionConfigurationMap.set('0040A027', { action: DeIdentificationActionCodes.X });
        // Visit Comments
        this.actionConfigurationMap.set('00384000', { action: DeIdentificationActionCodes.X });

    }

    // In RPB projects, some tags will be prefixed
    createRpbProfileActions() {

        // StudyDescription
        this.actionConfigurationMap.set('00081030', { action: DeIdentificationActionCodes.KP });
        // SeriesDescription
        this.actionConfigurationMap.set('0008103E', { action: DeIdentificationActionCodes.KP });
        // // ReferringPhysicianName
        // this.actionConfigurationMap.set('00080090', { action: DeIdentificationActionCodes.D });

        // Clinical Trial Subject Module - First removing all old items
        // ClinicalTrialSponsorName
        this.actionConfigurationMap.set('00120010', { action: DeIdentificationActionCodes.X });
        // ClinicalTrialProtocolID
        this.actionConfigurationMap.set('00120020', { action: DeIdentificationActionCodes.X });
        // ClinicalTrialProtocolName
        this.actionConfigurationMap.set('00120021', { action: DeIdentificationActionCodes.X });
        // ClinicalTrialSiteID
        this.actionConfigurationMap.set('00120030', { action: DeIdentificationActionCodes.X });
        // ClinicalTrialSiteName
        this.actionConfigurationMap.set('00120031', { action: DeIdentificationActionCodes.X });
        // ClinicalTrialSubjectID
        this.actionConfigurationMap.set('00120040', { action: DeIdentificationActionCodes.X });
        // Clinical Trial Coordinating Center Name
        this.actionConfigurationMap.set('00120060', { action: DeIdentificationActionCodes.X });
        // ClinicalTrialProtocolEthicsCommitteeName
        this.actionConfigurationMap.set('00120081', { action: DeIdentificationActionCodes.X });
        // Clinical Trial Protocol Ethics Committee Approval Number
        this.actionConfigurationMap.set('00120082', { action: DeIdentificationActionCodes.X });
        // Ethics Committee Approval Effectiveness Start Date
        this.actionConfigurationMap.set('00120086', { action: DeIdentificationActionCodes.X });
        // Ethics Committee Approval Effectiveness End Date
        this.actionConfigurationMap.set('00120087', { action: DeIdentificationActionCodes.X });

        // Device UID -overwrite keep in Retain Device Identity Option
        this.actionConfigurationMap.set('00181002', { action: DeIdentificationActionCodes.U });

        if (this.patientIdentitityRemoved === true) {
            // EncryptedAttributesSequence will be removed
            this.actionConfigurationMap.set('04000500', { action: DeIdentificationActionCodes.X });
        }

    }

    // Default replacements, based on the data type of the tag
    createDefaultReplacementsValuesMap() {
        this.defaultReplacementsValuesMap.set('default', '');
        // Date
        this.defaultReplacementsValuesMap.set(DicomValueRepresentations.DA, '19000101');
        // Date Time
        this.defaultReplacementsValuesMap.set(DicomValueRepresentations.DT, '000000.00');
        // Time
        this.defaultReplacementsValuesMap.set(DicomValueRepresentations.TM, '000000.000000');
        // Person Name
        this.defaultReplacementsValuesMap.set(DicomValueRepresentations.PN, 'PN');
    }

    createTagSpecificReplacementsValuesMap() {

        // The patient name and patient Id will be replaced by the PID (pseudonym of the specific patient)
        if (this.uploadSlot.pid != undefined) {
            // PatientName
            this.tagSpecificReplacementsValuesMap.set('00100010', this.uploadSlot.pid);
            // PatientID
            this.tagSpecificReplacementsValuesMap.set('00100020', this.uploadSlot.pid);
        }

    }

    createRetainDeviceIdentityOption() {
        // annotation that the method is used and identitity is not removed
        this.appliedDeIdentificationSteps.push({
            codeValue: DeIdentificationProfileCodes.RETAIN_DEVICE_IDENTITY,
            codeMeaning: DeIdentificationProfileCodesMeaning.RETAIN_DEVICE_IDENTITY,
        });

        // Beam Hold Transition DateTime
        this.actionConfigurationMap.set('300C0127', { action: DeIdentificationActionCodes.K });
        // Calibration Date
        this.actionConfigurationMap.set('0014407E', { action: DeIdentificationActionCodes.K });
        // Calibration DateTime
        this.actionConfigurationMap.set('00181203', { action: DeIdentificationActionCodes.K });
        // Calibration Time
        this.actionConfigurationMap.set('0014407C', { action: DeIdentificationActionCodes.K });
        // Cassette ID
        this.actionConfigurationMap.set('00181007', { action: DeIdentificationActionCodes.K });
        // Date of Last Calibration
        this.actionConfigurationMap.set('00181200', { action: DeIdentificationActionCodes.K });
        // Date of Last Detector Calibration
        this.actionConfigurationMap.set('0018700C', { action: DeIdentificationActionCodes.K });
        // DateTime of Last Calibration
        this.actionConfigurationMap.set('00181202', { action: DeIdentificationActionCodes.K });
        // Detector ID
        this.actionConfigurationMap.set('0018700A', { action: DeIdentificationActionCodes.K });
        // Device Description
        this.actionConfigurationMap.set('00500020', { action: DeIdentificationActionCodes.K });
        // Device Label
        this.actionConfigurationMap.set('3010002D', { action: DeIdentificationActionCodes.K });
        // Device Serial Number
        this.actionConfigurationMap.set('00181000', { action: DeIdentificationActionCodes.K });
        // Device UID
        this.actionConfigurationMap.set('00181002', { action: DeIdentificationActionCodes.K });
        // Gantry ID
        this.actionConfigurationMap.set('00181008', { action: DeIdentificationActionCodes.K });
        // Generator ID
        this.actionConfigurationMap.set('00181005', { action: DeIdentificationActionCodes.K });
        // Lens Make
        this.actionConfigurationMap.set('0016004F', { action: DeIdentificationActionCodes.K });
        // Lens Model
        this.actionConfigurationMap.set('00160050', { action: DeIdentificationActionCodes.K });
        // Lens Serial Number
        this.actionConfigurationMap.set('00160051', { action: DeIdentificationActionCodes.K });
        // Lens Specification
        this.actionConfigurationMap.set('0016004E', { action: DeIdentificationActionCodes.K });
        // Manufacturer's Device Class UID
        this.actionConfigurationMap.set('0018100B', { action: DeIdentificationActionCodes.K });
        // Manufacturer's Device Identifier
        this.actionConfigurationMap.set('30100043', { action: DeIdentificationActionCodes.K });
        // Modifying Device ID
        this.actionConfigurationMap.set('00203401', { action: DeIdentificationActionCodes.K });
        // Modifying System
        this.actionConfigurationMap.set('04000563', { action: DeIdentificationActionCodes.K });
        // Performed Station AE Title
        this.actionConfigurationMap.set('00400241', { action: DeIdentificationActionCodes.K });
        // Performed Station Geographic Location Code Sequence
        this.actionConfigurationMap.set('00404030', { action: DeIdentificationActionCodes.K });
        // Performed Station Name
        this.actionConfigurationMap.set('00400242', { action: DeIdentificationActionCodes.K });
        // Performed Station Name Code Sequence
        this.actionConfigurationMap.set('00404028', { action: DeIdentificationActionCodes.K });
        // Plate ID
        this.actionConfigurationMap.set('00181004', { action: DeIdentificationActionCodes.K });
        // Scheduled Procedure Step Location
        this.actionConfigurationMap.set('00400011', { action: DeIdentificationActionCodes.K });
        // Scheduled Station AE Title
        this.actionConfigurationMap.set('00400001', { action: DeIdentificationActionCodes.K });
        // Scheduled Station Geographic Location Code Sequence
        this.actionConfigurationMap.set('00404027', { action: DeIdentificationActionCodes.K });
        // Scheduled Station Name
        this.actionConfigurationMap.set('00400010', { action: DeIdentificationActionCodes.K });
        // Scheduled Station Name Code Sequence
        this.actionConfigurationMap.set('00404025', { action: DeIdentificationActionCodes.K });
        // Scheduled Study Location
        this.actionConfigurationMap.set('00321020', { action: DeIdentificationActionCodes.K });
        // Scheduled Study Location AE Title
        this.actionConfigurationMap.set('00321021', { action: DeIdentificationActionCodes.K });
        // Source Manufacturer
        this.actionConfigurationMap.set('300A0216', { action: DeIdentificationActionCodes.K });
        // Source Serial Number
        this.actionConfigurationMap.set('30080105', { action: DeIdentificationActionCodes.K });
        // Station Name
        this.actionConfigurationMap.set('00081010', { action: DeIdentificationActionCodes.K });
        // Time of Last Calibration
        this.actionConfigurationMap.set('00181201', { action: DeIdentificationActionCodes.K });
        // Time of Last Detector Calibration
        this.actionConfigurationMap.set('0018700E', { action: DeIdentificationActionCodes.K });
        // Transducer Identification Sequence
        this.actionConfigurationMap.set('00185011', { action: DeIdentificationActionCodes.K });
        // Treatment Machine Name
        this.actionConfigurationMap.set('300A00B2', { action: DeIdentificationActionCodes.K });
        // UDI Sequence
        this.actionConfigurationMap.set('0018100A', { action: DeIdentificationActionCodes.K });
        // Unique Device Identifier
        this.actionConfigurationMap.set('00181009', { action: DeIdentificationActionCodes.K });
        // X-Ray Detector ID
        this.actionConfigurationMap.set('00189371', { action: DeIdentificationActionCodes.K });
        // X-Ray Detector Label
        this.actionConfigurationMap.set('00189373', { action: DeIdentificationActionCodes.K });
        // X-Ray Source ID
        this.actionConfigurationMap.set('00189367', { action: DeIdentificationActionCodes.K });
    }

    createRetainPatienCharacteristicsOption() {
        this.appliedDeIdentificationSteps.push({
            codeValue: DeIdentificationProfileCodes.RETAIN_PATIENT_CHARACTERISTICS,
            codeMeaning: DeIdentificationProfileCodesMeaning.RETAIN_PATIENT_CHARACTERISTICS,
        });

        // Allergies
        this.actionConfigurationMap.set('00102110', { action: DeIdentificationActionCodes.C });
        // Ethnic Group
        this.actionConfigurationMap.set('00102160', { action: DeIdentificationActionCodes.K });
        // Patient's Age
        this.actionConfigurationMap.set('00101010', { action: DeIdentificationActionCodes.K });
        // Patient's Sex
        this.actionConfigurationMap.set('00100040', { action: DeIdentificationActionCodes.K });
        // Patient's Sex Neutered
        this.actionConfigurationMap.set('00102203', { action: DeIdentificationActionCodes.K });
        // Patient's Size
        this.actionConfigurationMap.set('00101020', { action: DeIdentificationActionCodes.K });
        // Patient's Weight
        this.actionConfigurationMap.set('00101030', { action: DeIdentificationActionCodes.K });
        // Patient State
        this.actionConfigurationMap.set('00380500', { action: DeIdentificationActionCodes.C });
        // Pregnancy Status
        this.actionConfigurationMap.set('001021C0', { action: DeIdentificationActionCodes.K });
        // Pre-Medication
        this.actionConfigurationMap.set('00400012', { action: DeIdentificationActionCodes.C });
        // Selector AS Value
        this.actionConfigurationMap.set('0072005F', { action: DeIdentificationActionCodes.K });
        // Smoking Status
        this.actionConfigurationMap.set('001021A0', { action: DeIdentificationActionCodes.K });
        // Special Needs
        this.actionConfigurationMap.set('00380050)', { action: DeIdentificationActionCodes.C });
    }

    createRetainFullDatesOption() {
        // annotation that the method is used and identitity is not removed
        this.appliedDeIdentificationSteps.push({
            codeValue: DeIdentificationProfileCodes.RETAIN_LONG_FULL_DATES,
            codeMeaning: DeIdentificationProfileCodesMeaning.RETAIN_LONG_FULL_DATES,
        });

        this.longitudinalTemporalInformationModified = LongitudinalTemporalInformationModifiedAttribute.UNMODIFIED;

        // Acquisition Date
        this.actionConfigurationMap.set('00080022', { action: DeIdentificationActionCodes.K });
        // Acquisition DateTime
        this.actionConfigurationMap.set('0008002A', { action: DeIdentificationActionCodes.K });
        // Acquisition DateTime
        this.actionConfigurationMap.set('00080032', { action: DeIdentificationActionCodes.K });
        // Admitting Date
        this.actionConfigurationMap.set('00380020', { action: DeIdentificationActionCodes.K });
        // Admitting Time
        this.actionConfigurationMap.set('00380021', { action: DeIdentificationActionCodes.K });
        // Approval Status DateTime
        this.actionConfigurationMap.set('00440004', { action: DeIdentificationActionCodes.K });
        // Assertion DateTime
        this.actionConfigurationMap.set('00440104', { action: DeIdentificationActionCodes.K });
        // Assertion Expiration DateTime
        this.actionConfigurationMap.set('00440105', { action: DeIdentificationActionCodes.K });
        // Attribute Modification DateTime
        this.actionConfigurationMap.set('04000562', { action: DeIdentificationActionCodes.K });
        // Beam Hold Transition DateTime
        this.actionConfigurationMap.set('300C0127', { action: DeIdentificationActionCodes.K });
        // Calibration Date
        this.actionConfigurationMap.set('0014407E', { action: DeIdentificationActionCodes.K });
        // Calibration DateTime
        this.actionConfigurationMap.set('00181203', { action: DeIdentificationActionCodes.K });
        // Calibration Time
        this.actionConfigurationMap.set('0014407C', { action: DeIdentificationActionCodes.K });
        // Certified Timestamp
        this.actionConfigurationMap.set('04000310', { action: DeIdentificationActionCodes.K });
        // Content Date
        this.actionConfigurationMap.set('00080023', { action: DeIdentificationActionCodes.K });
        // Content Time
        this.actionConfigurationMap.set('00080033', { action: DeIdentificationActionCodes.K });
        // Context Group Local Version
        this.actionConfigurationMap.set('00080107', { action: DeIdentificationActionCodes.K });
        // Context Group Version
        this.actionConfigurationMap.set('00080106', { action: DeIdentificationActionCodes.K });
        // Contrast/Bolus Start Time
        this.actionConfigurationMap.set('00181042', { action: DeIdentificationActionCodes.K });
        // Contrast/Bolus Stop Time
        this.actionConfigurationMap.set('00181043', { action: DeIdentificationActionCodes.K });
        // Contribution DateTime
        this.actionConfigurationMap.set('0018A002', { action: DeIdentificationActionCodes.K });
        // Creation Date
        this.actionConfigurationMap.set('21000040', { action: DeIdentificationActionCodes.K });
        // Creation Time
        this.actionConfigurationMap.set('21000050', { action: DeIdentificationActionCodes.K });
        // Curve Date
        this.actionConfigurationMap.set('00080025', { action: DeIdentificationActionCodes.K });
        // Curve Time
        this.actionConfigurationMap.set('00080035', { action: DeIdentificationActionCodes.K });
        // Date
        this.actionConfigurationMap.set('0040A121', { action: DeIdentificationActionCodes.K });
        // Date of Document or Verbal Transaction (Trial)
        this.actionConfigurationMap.set('0040A110', { action: DeIdentificationActionCodes.K });
        // Date of Last Calibration
        this.actionConfigurationMap.set('00181200', { action: DeIdentificationActionCodes.K });
        // Date of Last Detector Calibration
        this.actionConfigurationMap.set('0018700C', { action: DeIdentificationActionCodes.K });
        // Date of Secondary Capture
        this.actionConfigurationMap.set('00181012', { action: DeIdentificationActionCodes.K });
        // DateTime
        this.actionConfigurationMap.set('0040A120', { action: DeIdentificationActionCodes.K });
        // DateTime of Last Calibration
        this.actionConfigurationMap.set('00181202', { action: DeIdentificationActionCodes.K });
        // Decay Correction DateTime
        this.actionConfigurationMap.set('00189701', { action: DeIdentificationActionCodes.K });
        // Digital Signature DateTime
        this.actionConfigurationMap.set('04000105', { action: DeIdentificationActionCodes.K });
        // Discharge Date
        this.actionConfigurationMap.set('00380030', { action: DeIdentificationActionCodes.K });
        // Discharge Time
        this.actionConfigurationMap.set('00380032', { action: DeIdentificationActionCodes.K });
        // Effective DateTime
        this.actionConfigurationMap.set('00686226', { action: DeIdentificationActionCodes.K });
        // End Acquisition DateTime
        this.actionConfigurationMap.set('00189517', { action: DeIdentificationActionCodes.K });
        // Ethics Committee Approval Effectiveness End Date
        this.actionConfigurationMap.set('00120087', { action: DeIdentificationActionCodes.K });
        // Ethics Committee Approval Effectiveness Start Date
        this.actionConfigurationMap.set('00120086', { action: DeIdentificationActionCodes.K });
        // Exclusion Start DateTime
        this.actionConfigurationMap.set('00189804', { action: DeIdentificationActionCodes.K });
        // Expected Completion DateTime
        this.actionConfigurationMap.set('00404011', { action: DeIdentificationActionCodes.K });
        // Findings Group Recording Date (Trial)
        this.actionConfigurationMap.set('0040A023', { action: DeIdentificationActionCodes.K });
        // Findings Group Recording Time (Trial)
        this.actionConfigurationMap.set('0040A024', { action: DeIdentificationActionCodes.K });
        // First Treatment Date
        this.actionConfigurationMap.set('30080054', { action: DeIdentificationActionCodes.K });
        // Frame Acquisition DateTime
        this.actionConfigurationMap.set('00189074', { action: DeIdentificationActionCodes.K });
        // Frame Origin Timestamp
        this.actionConfigurationMap.set('00340007', { action: DeIdentificationActionCodes.K });
        // Frame Reference DateTime
        this.actionConfigurationMap.set('00189151', { action: DeIdentificationActionCodes.K });
        // Functional Sync Pulse
        this.actionConfigurationMap.set('00189623', { action: DeIdentificationActionCodes.K });
        // GPS Date​ Stamp
        this.actionConfigurationMap.set('0016008D', { action: DeIdentificationActionCodes.K });
        // Hanging Protocol Creation DateTime
        this.actionConfigurationMap.set('0072000A', { action: DeIdentificationActionCodes.K });
        // HL7 Document Effective Time
        this.actionConfigurationMap.set('0040E004', { action: DeIdentificationActionCodes.K });
        // Impedance Measurement DateTime
        this.actionConfigurationMap.set('003A0314', { action: DeIdentificationActionCodes.K });
        // Information Issue DateTime
        this.actionConfigurationMap.set('00686270', { action: DeIdentificationActionCodes.K });
        // Instance Coercion DateTime
        this.actionConfigurationMap.set('00080015', { action: DeIdentificationActionCodes.K });
        // Instance Creation Date
        this.actionConfigurationMap.set('00080012', { action: DeIdentificationActionCodes.K });
        // Instance Creation Time
        this.actionConfigurationMap.set('00080012', { action: DeIdentificationActionCodes.K });
        // Instruction Performed DateTime
        this.actionConfigurationMap.set('00189919', { action: DeIdentificationActionCodes.K });
        // Intended Fraction Start Time
        this.actionConfigurationMap.set('30100085', { action: DeIdentificationActionCodes.K });
        // Intended Phase End Date
        this.actionConfigurationMap.set('3010004D', { action: DeIdentificationActionCodes.K });
        // Intended Phase Start Date
        this.actionConfigurationMap.set('3010004C', { action: DeIdentificationActionCodes.K });
        // Interlock DateTime
        this.actionConfigurationMap.set('300A0741', { action: DeIdentificationActionCodes.K });
        // Interpretation Approval Date
        this.actionConfigurationMap.set('40080112', { action: DeIdentificationActionCodes.K });
        // Interpretation Approval Time
        this.actionConfigurationMap.set('40080113', { action: DeIdentificationActionCodes.K });
        // Interpretation Recorded Date
        this.actionConfigurationMap.set('40080100', { action: DeIdentificationActionCodes.K });
        // Interpretation Recorded Time
        this.actionConfigurationMap.set('40080101', { action: DeIdentificationActionCodes.K });
        // Interpretation Transcription Date
        this.actionConfigurationMap.set('40080108', { action: DeIdentificationActionCodes.K });
        // Interpretation Transcription Time
        this.actionConfigurationMap.set('40080109', { action: DeIdentificationActionCodes.K });
        // Intervention Drug Start Time
        this.actionConfigurationMap.set('00180035', { action: DeIdentificationActionCodes.K });
        // Intervention Drug Stop Time
        this.actionConfigurationMap.set('00180027', { action: DeIdentificationActionCodes.K });
        // Issue Date of Imaging Service Request
        this.actionConfigurationMap.set('00402004', { action: DeIdentificationActionCodes.K });
        // Issue Time of Imaging Service Request
        this.actionConfigurationMap.set('00402005', { action: DeIdentificationActionCodes.K });
        // Last Menstrual Date
        this.actionConfigurationMap.set('001021D0', { action: DeIdentificationActionCodes.K });
        // Modified Image Date
        this.actionConfigurationMap.set('00203403', { action: DeIdentificationActionCodes.K });
        // Modified Image Time
        this.actionConfigurationMap.set('00203405', { action: DeIdentificationActionCodes.K });
        // Most Recent Treatment Date
        this.actionConfigurationMap.set('30080056', { action: DeIdentificationActionCodes.K });
        // Observation Date (Trial)
        this.actionConfigurationMap.set('0040A192', { action: DeIdentificationActionCodes.K });
        // Observation DateTime
        this.actionConfigurationMap.set('0040A032', { action: DeIdentificationActionCodes.K });
        // Observation Start DateTime
        this.actionConfigurationMap.set('0040A033', { action: DeIdentificationActionCodes.K });
        // Observation Time (Trial)
        this.actionConfigurationMap.set('0040A193', { action: DeIdentificationActionCodes.K });
        // Overlay Date
        this.actionConfigurationMap.set('00080024', { action: DeIdentificationActionCodes.K });
        // Overlay Time
        this.actionConfigurationMap.set('00080034', { action: DeIdentificationActionCodes.K });
        // Override DateTime
        this.actionConfigurationMap.set('300A0760', { action: DeIdentificationActionCodes.K });
        // Participation DateTime
        this.actionConfigurationMap.set('0040A082', { action: DeIdentificationActionCodes.K });
        // Performed Procedure Step End Date
        this.actionConfigurationMap.set('00400250', { action: DeIdentificationActionCodes.K });
        // Performed Procedure Step End DateTime
        this.actionConfigurationMap.set('00404051', { action: DeIdentificationActionCodes.K });
        // Performed Procedure Step End Time
        this.actionConfigurationMap.set('00400251', { action: DeIdentificationActionCodes.K });
        // Performed Procedure Step Start Date
        this.actionConfigurationMap.set('00400244', { action: DeIdentificationActionCodes.K });
        // Performed Procedure Step Start DateTime
        this.actionConfigurationMap.set('00404050', { action: DeIdentificationActionCodes.K });
        // Performed Procedure Step Start Time
        this.actionConfigurationMap.set('00400245', { action: DeIdentificationActionCodes.K });
        // Presentation Creation Date
        this.actionConfigurationMap.set('00700082', { action: DeIdentificationActionCodes.K });
        // Presentation Creation Time
        this.actionConfigurationMap.set('00700083', { action: DeIdentificationActionCodes.K });
        // Procedure Step Cancellation DateTime
        this.actionConfigurationMap.set('00404052', { action: DeIdentificationActionCodes.K });
        // Product Expiration DateTime
        this.actionConfigurationMap.set('0044000B', { action: DeIdentificationActionCodes.K });
        // Radiopharmaceutical Start DateTime
        this.actionConfigurationMap.set('00181078', { action: DeIdentificationActionCodes.K });
        // Radiopharmaceutical Start Time
        this.actionConfigurationMap.set('00181072', { action: DeIdentificationActionCodes.K });
        // Radiopharmaceutical Stop DateTime
        this.actionConfigurationMap.set('00181079', { action: DeIdentificationActionCodes.K });
        // Radiopharmaceutical Stop Time
        this.actionConfigurationMap.set('00181073', { action: DeIdentificationActionCodes.K });
        // Recorded RT Control Point DateTime
        this.actionConfigurationMap.set('300A073A', { action: DeIdentificationActionCodes.K });
        // Referenced DateTime
        this.actionConfigurationMap.set('0040A13A', { action: DeIdentificationActionCodes.K });
        // Review Date
        this.actionConfigurationMap.set('300E0004', { action: DeIdentificationActionCodes.K });
        // Review Time
        this.actionConfigurationMap.set('300E0005', { action: DeIdentificationActionCodes.K });
        // RT Plan Date
        this.actionConfigurationMap.set('300A0006', { action: DeIdentificationActionCodes.K });
        // RT Plan Time
        this.actionConfigurationMap.set('300A0007', { action: DeIdentificationActionCodes.K });
        // Safe Position Exit Date
        this.actionConfigurationMap.set('30080162', { action: DeIdentificationActionCodes.K });
        // Safe Position Exit Time
        this.actionConfigurationMap.set('30080164', { action: DeIdentificationActionCodes.K });
        // Safe Position Return Date
        this.actionConfigurationMap.set('30080166', { action: DeIdentificationActionCodes.K });
        // Safe Position Return Time
        this.actionConfigurationMap.set('30080168', { action: DeIdentificationActionCodes.K });
        // Scheduled Admission Date
        this.actionConfigurationMap.set('0038001A', { action: DeIdentificationActionCodes.K });
        // Scheduled Admission Time
        this.actionConfigurationMap.set('0038001B', { action: DeIdentificationActionCodes.K });
        // Scheduled Discharge Date
        this.actionConfigurationMap.set('0038001C', { action: DeIdentificationActionCodes.K });
        // Scheduled Discharge Time
        this.actionConfigurationMap.set('0038001D', { action: DeIdentificationActionCodes.K });
        // Scheduled Procedure Step End Date
        this.actionConfigurationMap.set('00400004', { action: DeIdentificationActionCodes.K });
        // Scheduled Procedure Step End Time
        this.actionConfigurationMap.set('00400005', { action: DeIdentificationActionCodes.K });
        // Scheduled Procedure Step Expiration DateTime
        this.actionConfigurationMap.set('00404008', { action: DeIdentificationActionCodes.K });
        // Scheduled Procedure Step Modification DateTime
        this.actionConfigurationMap.set('00404010', { action: DeIdentificationActionCodes.K });
        // Scheduled Procedure Step Start Date
        this.actionConfigurationMap.set('00400002', { action: DeIdentificationActionCodes.K });
        // Scheduled Procedure Step Start DateTime
        this.actionConfigurationMap.set('00404005', { action: DeIdentificationActionCodes.K });
        // Scheduled Procedure Step Start Time
        this.actionConfigurationMap.set('00400003', { action: DeIdentificationActionCodes.K });
        // Scheduled Study Start Date
        this.actionConfigurationMap.set('00321000', { action: DeIdentificationActionCodes.K });
        // Scheduled Study Start Time
        this.actionConfigurationMap.set('00321001', { action: DeIdentificationActionCodes.K });
        // Scheduled Study Stop Date
        this.actionConfigurationMap.set('00321010', { action: DeIdentificationActionCodes.K });
        // Scheduled Study Stop Time
        this.actionConfigurationMap.set('00321011', { action: DeIdentificationActionCodes.K });
        // Selector DA Value
        this.actionConfigurationMap.set('00720061', { action: DeIdentificationActionCodes.K });
        // Selector DT Value
        this.actionConfigurationMap.set('00720063', { action: DeIdentificationActionCodes.K });
        // Selector TM Value
        this.actionConfigurationMap.set('0072006B', { action: DeIdentificationActionCodes.K });
        // Series Date
        this.actionConfigurationMap.set('00080021', { action: DeIdentificationActionCodes.K });
        // Series Time
        this.actionConfigurationMap.set('00080031', { action: DeIdentificationActionCodes.K });
        // SOP Authorization DateTime
        this.actionConfigurationMap.set('01000420', { action: DeIdentificationActionCodes.K });
        // Source End DateTime
        this.actionConfigurationMap.set('0018936A', { action: DeIdentificationActionCodes.K });
        // Source Start DateTime
        this.actionConfigurationMap.set('00189369', { action: DeIdentificationActionCodes.K });
        // Source Strength Reference Date
        this.actionConfigurationMap.set('300A022C', { action: DeIdentificationActionCodes.K });
        // Source Strength Reference Time
        this.actionConfigurationMap.set('300A022E', { action: DeIdentificationActionCodes.K });
        // Start Acquisition DateTime
        this.actionConfigurationMap.set('00189516', { action: DeIdentificationActionCodes.K });
        // Structure Set Date
        this.actionConfigurationMap.set('30060008', { action: DeIdentificationActionCodes.K });
        // Structure Set Time
        this.actionConfigurationMap.set('30060009', { action: DeIdentificationActionCodes.K });
        // Study Arrival Date
        this.actionConfigurationMap.set('00321040', { action: DeIdentificationActionCodes.K });
        // Study Arrival Time
        this.actionConfigurationMap.set('00321041', { action: DeIdentificationActionCodes.K });
        // Study Completion Date
        this.actionConfigurationMap.set('00321050', { action: DeIdentificationActionCodes.K });
        // Study Completion Time
        this.actionConfigurationMap.set('00321051', { action: DeIdentificationActionCodes.K });
        // Study Date
        this.actionConfigurationMap.set('00080020', { action: DeIdentificationActionCodes.K });
        // Study Read Date
        this.actionConfigurationMap.set('00320034', { action: DeIdentificationActionCodes.K });
        // Study Read Time
        this.actionConfigurationMap.set('00320035', { action: DeIdentificationActionCodes.K });
        // Study Time
        this.actionConfigurationMap.set('00080030', { action: DeIdentificationActionCodes.K });
        // Study Verified Date
        this.actionConfigurationMap.set('00320032', { action: DeIdentificationActionCodes.K });
        // Study Verified Time
        this.actionConfigurationMap.set('00320033', { action: DeIdentificationActionCodes.K });
        // Substance Administration DateTime
        this.actionConfigurationMap.set('00440010', { action: DeIdentificationActionCodes.K });
        // Template Local Version
        this.actionConfigurationMap.set('0040DB07', { action: DeIdentificationActionCodes.K });
        // Template Version
        this.actionConfigurationMap.set('0040DB06', { action: DeIdentificationActionCodes.K });
        // Time
        this.actionConfigurationMap.set('0040A122', { action: DeIdentificationActionCodes.K });
        // Time of Document or Verbal Transaction (Trial)
        this.actionConfigurationMap.set('0040A112', { action: DeIdentificationActionCodes.K });
        // Time of Last Calibration
        this.actionConfigurationMap.set('00181201', { action: DeIdentificationActionCodes.K });
        // Time of Last Detector Calibration
        this.actionConfigurationMap.set('0018700E', { action: DeIdentificationActionCodes.K });
        // Time of Secondary Capture
        this.actionConfigurationMap.set('00181014', { action: DeIdentificationActionCodes.K });
        // Timezone Offset From UTC
        this.actionConfigurationMap.set('00080201', { action: DeIdentificationActionCodes.K });
        // Treatment Control Point Date
        this.actionConfigurationMap.set('30080024', { action: DeIdentificationActionCodes.K });
        // Treatment Control Point Time
        this.actionConfigurationMap.set('30080025', { action: DeIdentificationActionCodes.K });
        // Treatment Date
        this.actionConfigurationMap.set('30080250', { action: DeIdentificationActionCodes.K });
        // Treatment Time
        this.actionConfigurationMap.set('30080251', { action: DeIdentificationActionCodes.K });
        // Treatment Tolerance Violation DateTime
        this.actionConfigurationMap.set('300A0736', { action: DeIdentificationActionCodes.K });
        // Verification DateTime
        this.actionConfigurationMap.set('0040A030', { action: DeIdentificationActionCodes.K });
    }

    createCleanStructuredContentOption() {
        // annotation that the method is used and identitity is not removed
        this.appliedDeIdentificationSteps.push({
            codeValue: DeIdentificationProfileCodes.CLEAN_STRUCTURED_CONTENT,
            codeMeaning: DeIdentificationProfileCodesMeaning.CLEAN_STRUCTURED_CONTENT,
        });

        // Acquisition Date
        this.actionConfigurationMap.set('00400555', { action: DeIdentificationActionCodes.C });
        // Content Sequence
        this.actionConfigurationMap.set('0040A730', { action: DeIdentificationActionCodes.C });
        // Specimen Preparation Sequence
        this.actionConfigurationMap.set('00400610', { action: DeIdentificationActionCodes.C });
    }

    createCleanDescriptorsOption() {
        // annotation that the method is used and identitity is not removed
        this.appliedDeIdentificationSteps.push({
            codeValue: DeIdentificationProfileCodes.CLEAN_DESCRIPTORS,
            codeMeaning: DeIdentificationProfileCodesMeaning.CLEAN_DESCRIPTORS,
        });

        // Acquisition Comments
        this.actionConfigurationMap.set('00184000', { action: DeIdentificationActionCodes.C });
        // Acquisition Device Processing Description
        this.actionConfigurationMap.set('00181400', { action: DeIdentificationActionCodes.C });
        // Acquisition Field Of View Label
        this.actionConfigurationMap.set('001811BB', { action: DeIdentificationActionCodes.C });
        // Acquisition Protocol Description
        this.actionConfigurationMap.set('00189424', { action: DeIdentificationActionCodes.C });
        // Additional Patient History
        this.actionConfigurationMap.set('001021B0', { action: DeIdentificationActionCodes.C });
        // Admitting Diagnoses Code Sequence
        this.actionConfigurationMap.set('00081084', { action: DeIdentificationActionCodes.C });
        // Admitting Diagnoses Description
        this.actionConfigurationMap.set('00081080', { action: DeIdentificationActionCodes.C });
        // Allergies
        this.actionConfigurationMap.set('00102110', { action: DeIdentificationActionCodes.C });
        // Annotation Group Description
        this.actionConfigurationMap.set('006A0006', { action: DeIdentificationActionCodes.C });
        // Annotation Group Label
        this.actionConfigurationMap.set('006A0005', { action: DeIdentificationActionCodes.C });
        // Beam Description
        this.actionConfigurationMap.set('300A00C3', { action: DeIdentificationActionCodes.C });
        // Bolus Description
        this.actionConfigurationMap.set('300A00DD', { action: DeIdentificationActionCodes.C });
        // Clinical Trial Series Description
        this.actionConfigurationMap.set('00120072', { action: DeIdentificationActionCodes.C });
        // Clinical Trial Time Point Description
        this.actionConfigurationMap.set('00120051', { action: DeIdentificationActionCodes.C });
        // Comments on Radiation Dose
        this.actionConfigurationMap.set('00400310', { action: DeIdentificationActionCodes.C });
        // Comments on the Performed Procedure Step
        this.actionConfigurationMap.set('00400280', { action: DeIdentificationActionCodes.C });
        // Compensator Description
        this.actionConfigurationMap.set('300A02EB', { action: DeIdentificationActionCodes.C });
        // Conceptual Volume Combination Description
        this.actionConfigurationMap.set('3010000F', { action: DeIdentificationActionCodes.C });
        // Conceptual Volume Description
        this.actionConfigurationMap.set('30100017', { action: DeIdentificationActionCodes.C });
        // Container Description
        this.actionConfigurationMap.set('0040051A', { action: DeIdentificationActionCodes.C });
        // Contrast/Bolus Agent
        this.actionConfigurationMap.set('00180010', { action: DeIdentificationActionCodes.C });
        // Contribution Description
        this.actionConfigurationMap.set('0018A003', { action: DeIdentificationActionCodes.C });
        // Decomposition Description
        this.actionConfigurationMap.set('0018937F', { action: DeIdentificationActionCodes.C });
        // Derivation Description
        this.actionConfigurationMap.set('00082111', { action: DeIdentificationActionCodes.C });
        // Device Setting Description
        this.actionConfigurationMap.set('0016004B', { action: DeIdentificationActionCodes.C });
        // Discharge Diagnosis Description
        this.actionConfigurationMap.set('00380040', { action: DeIdentificationActionCodes.C });
        // Displacement Reference Label
        this.actionConfigurationMap.set('300A079A', { action: DeIdentificationActionCodes.C });
        // Dose Reference Description
        this.actionConfigurationMap.set('300A0016', { action: DeIdentificationActionCodes.C });
        // Entity Description
        this.actionConfigurationMap.set('30100037', { action: DeIdentificationActionCodes.C });
        // Entity Label
        this.actionConfigurationMap.set('30100035', { action: DeIdentificationActionCodes.C });
        // Entity Long Label
        this.actionConfigurationMap.set('30100038', { action: DeIdentificationActionCodes.C });
        // Entity Name
        this.actionConfigurationMap.set('30100036', { action: DeIdentificationActionCodes.C });
        // Equipment Frame of Reference Description
        this.actionConfigurationMap.set('300A0676', { action: DeIdentificationActionCodes.C });
        // Filter Lookup Table Description
        this.actionConfigurationMap.set('003A032B', { action: DeIdentificationActionCodes.C });
        // Fixation Device Description
        this.actionConfigurationMap.set('300A0196', { action: DeIdentificationActionCodes.C });
        // Fractionation Notes
        this.actionConfigurationMap.set('3010007F', { action: DeIdentificationActionCodes.C });
        // Fraction Group Description
        this.actionConfigurationMap.set('300A0072', { action: DeIdentificationActionCodes.C });
        // Frame Comments
        this.actionConfigurationMap.set('00209158', { action: DeIdentificationActionCodes.C });
        // Identifying Comments
        this.actionConfigurationMap.set('00084000', { action: DeIdentificationActionCodes.C });
        // Image Comments
        this.actionConfigurationMap.set('00204000', { action: DeIdentificationActionCodes.C });
        // Imaging Service Request Comments
        this.actionConfigurationMap.set('00402400', { action: DeIdentificationActionCodes.C });
        // Impressions
        this.actionConfigurationMap.set('40080300', { action: DeIdentificationActionCodes.C });
        // Interlock Description
        this.actionConfigurationMap.set('300A0742', { action: DeIdentificationActionCodes.C });
        // Interlock Origin Description
        this.actionConfigurationMap.set('300A0783', { action: DeIdentificationActionCodes.C });
        // Interpretation Diagnosis Description
        this.actionConfigurationMap.set('40080115', { action: DeIdentificationActionCodes.C });
        // Interpretation Text
        this.actionConfigurationMap.set('4008010B', { action: DeIdentificationActionCodes.C });
        // Label Text
        this.actionConfigurationMap.set('22000002', { action: DeIdentificationActionCodes.C });
        // Long Device Description
        this.actionConfigurationMap.set('00500021', { action: DeIdentificationActionCodes.C });
        // Maker Note
        this.actionConfigurationMap.set('0016002B', { action: DeIdentificationActionCodes.C });
        // Medical Alerts
        this.actionConfigurationMap.set('00102000', { action: DeIdentificationActionCodes.C });
        // Multi-energy Acquisition Description
        this.actionConfigurationMap.set('0018937B', { action: DeIdentificationActionCodes.C });
        // Occupation
        this.actionConfigurationMap.set('00102180', { action: DeIdentificationActionCodes.C });
        // Patient Comments
        this.actionConfigurationMap.set('00104000', { action: DeIdentificationActionCodes.C });
        // Patient Setup Photo Description
        this.actionConfigurationMap.set('300A0794', { action: DeIdentificationActionCodes.C });
        // Patient State
        this.actionConfigurationMap.set('00380500', { action: DeIdentificationActionCodes.C });
        // Patient Treatment Preparation Method Description
        this.actionConfigurationMap.set('300A0792', { action: DeIdentificationActionCodes.C });
        // Patient Treatment Preparation Procedure Parameter Description
        this.actionConfigurationMap.set('300A078E', { action: DeIdentificationActionCodes.C });
        // Performed Procedure Step Description
        this.actionConfigurationMap.set('00400254', { action: DeIdentificationActionCodes.C });
        // Prescription Description
        this.actionConfigurationMap.set('300A000E', { action: DeIdentificationActionCodes.C });
        // Prescription Notes
        this.actionConfigurationMap.set('3010007B', { action: DeIdentificationActionCodes.C });
        // Prescription Notes Sequence
        this.actionConfigurationMap.set('30100081', { action: DeIdentificationActionCodes.C });
        // Prior Treatment Dose Description
        this.actionConfigurationMap.set('30100061', { action: DeIdentificationActionCodes.C });
        // Protocol Name
        this.actionConfigurationMap.set('00181030', { action: DeIdentificationActionCodes.C });
        // Pyramid Description
        this.actionConfigurationMap.set('00081088', { action: DeIdentificationActionCodes.C });
        // Pyramid Label
        this.actionConfigurationMap.set('00200027', { action: DeIdentificationActionCodes.C });
        // Radiation Dose Identification Label
        this.actionConfigurationMap.set('300A0619', { action: DeIdentificationActionCodes.C });
        // Radiation Dose In-Vivo Measurement Label
        this.actionConfigurationMap.set('300A0623', { action: DeIdentificationActionCodes.C });
        // Radiation Generation Mode Description
        this.actionConfigurationMap.set('300A067D', { action: DeIdentificationActionCodes.C });
        // Radiation Generation Mode Label
        this.actionConfigurationMap.set('300A067C', { action: DeIdentificationActionCodes.C });
        // Reason for Omission Description
        this.actionConfigurationMap.set('300C0113', { action: DeIdentificationActionCodes.C });
        // Reason for Requested Procedure Code Sequence
        this.actionConfigurationMap.set('0040100A', { action: DeIdentificationActionCodes.C });
        // Reason for Study
        this.actionConfigurationMap.set('00321030', { action: DeIdentificationActionCodes.C });
        // Reason for Superseding
        this.actionConfigurationMap.set('3010005C', { action: DeIdentificationActionCodes.C });
        // Reason for the Attribute Modification
        this.actionConfigurationMap.set('04000565', { action: DeIdentificationActionCodes.C });
        // Reason for the Imaging Service Request
        this.actionConfigurationMap.set('00402001', { action: DeIdentificationActionCodes.C });
        // Reason for the Requested Procedure
        this.actionConfigurationMap.set('00401002', { action: DeIdentificationActionCodes.C });
        // Reason for Visit
        this.actionConfigurationMap.set('00321066', { action: DeIdentificationActionCodes.C });
        // Reason for Visit Code Sequence
        this.actionConfigurationMap.set('00321067', { action: DeIdentificationActionCodes.C });
        // Request Attributes Sequence
        this.actionConfigurationMap.set('00400275', { action: DeIdentificationActionCodes.C });
        // Requested Contrast Agent
        this.actionConfigurationMap.set('00321070', { action: DeIdentificationActionCodes.C });
        // Requested Procedure Comments
        this.actionConfigurationMap.set('00401400', { action: DeIdentificationActionCodes.C });
        // Requested Procedure Description
        this.actionConfigurationMap.set('00321060', { action: DeIdentificationActionCodes.C });
        // Requested Series Description
        this.actionConfigurationMap.set('00189937', { action: DeIdentificationActionCodes.C });
        // Respiratory Motion Compensation Technique Description
        this.actionConfigurationMap.set('00189185', { action: DeIdentificationActionCodes.C });
        // Results Comments
        this.actionConfigurationMap.set('40084000', { action: DeIdentificationActionCodes.C });
        // ROI Description
        this.actionConfigurationMap.set('30060028', { action: DeIdentificationActionCodes.C });
        // ROI Generation Description
        this.actionConfigurationMap.set('30060038', { action: DeIdentificationActionCodes.C });
        // ROI Name
        this.actionConfigurationMap.set('30060026', { action: DeIdentificationActionCodes.C });
        // ROI Observation Description
        this.actionConfigurationMap.set('30060088', { action: DeIdentificationActionCodes.C });
        // ROI Observation Label
        this.actionConfigurationMap.set('30060085', { action: DeIdentificationActionCodes.C });
        // RT Physician Intent Narrative
        this.actionConfigurationMap.set('3010005A', { action: DeIdentificationActionCodes.C });
        // RT Plan Description
        this.actionConfigurationMap.set('300A0004', { action: DeIdentificationActionCodes.C });
        // RT Plan Label
        this.actionConfigurationMap.set('300A0002', { action: DeIdentificationActionCodes.C });
        // RT Plan Name
        this.actionConfigurationMap.set('300A0003', { action: DeIdentificationActionCodes.C });
        // RT Prescription Label
        this.actionConfigurationMap.set('30100054', { action: DeIdentificationActionCodes.C });
        // RT Tolerance Set Label
        this.actionConfigurationMap.set('300A062A', { action: DeIdentificationActionCodes.C });
        // RT Treatment Approach Label
        this.actionConfigurationMap.set('30100056', { action: DeIdentificationActionCodes.C });
        // Scheduled Procedure Step Description
        this.actionConfigurationMap.set('00400007', { action: DeIdentificationActionCodes.C });
        // Selector LO Value
        this.actionConfigurationMap.set('00720066', { action: DeIdentificationActionCodes.C });
        // Selector LT Value
        this.actionConfigurationMap.set('00720068', { action: DeIdentificationActionCodes.C });
        // Selector SH Value
        this.actionConfigurationMap.set('0072006C', { action: DeIdentificationActionCodes.C });
        // Selector ST Value
        this.actionConfigurationMap.set('0072006E', { action: DeIdentificationActionCodes.C });
        // Selector UT Value
        this.actionConfigurationMap.set('00720070', { action: DeIdentificationActionCodes.C });
        // Series Description
        this.actionConfigurationMap.set('0008103E', { action: DeIdentificationActionCodes.C });
        // Service Episode Description
        this.actionConfigurationMap.set('00380062', { action: DeIdentificationActionCodes.C });
        // Setup Technique Description
        this.actionConfigurationMap.set('300A01B2', { action: DeIdentificationActionCodes.C });
        // Shielding Device Description
        this.actionConfigurationMap.set('300A01A6', { action: DeIdentificationActionCodes.C });
        // Specimen Detailed Description
        this.actionConfigurationMap.set('00400602', { action: DeIdentificationActionCodes.C });
        // Specimen Short Description
        this.actionConfigurationMap.set('00400600', { action: DeIdentificationActionCodes.C });
        // Structure Set Description
        this.actionConfigurationMap.set('30060006', { action: DeIdentificationActionCodes.C });
        // Structure Set Label
        this.actionConfigurationMap.set('30060002', { action: DeIdentificationActionCodes.C });
        // Structure Set Name
        this.actionConfigurationMap.set('30060004', { action: DeIdentificationActionCodes.C });
        // Study Comments
        this.actionConfigurationMap.set('00324000', { action: DeIdentificationActionCodes.C });
        // Study Description
        this.actionConfigurationMap.set('00081030', { action: DeIdentificationActionCodes.C });
        // Treatment Position Group Label
        this.actionConfigurationMap.set('300A0608', { action: DeIdentificationActionCodes.C });
        // Treatment Position Group Label
        this.actionConfigurationMap.set('300A0608', { action: DeIdentificationActionCodes.C });
        // Treatment Site
        this.actionConfigurationMap.set('30100077', { action: DeIdentificationActionCodes.C });
        // Treatment Sites
        this.actionConfigurationMap.set('300A000B', { action: DeIdentificationActionCodes.C });
        // Treatment Technique Notes
        this.actionConfigurationMap.set('3010007A', { action: DeIdentificationActionCodes.C });
        // Treatment Tolerance Violation Description
        this.actionConfigurationMap.set('300A0734', { action: DeIdentificationActionCodes.C });
        // User Content Label
        this.actionConfigurationMap.set('30100033', { action: DeIdentificationActionCodes.C });
        // User Content Long Label
        this.actionConfigurationMap.set('30100034', { action: DeIdentificationActionCodes.C });
        // Visit Comments
        this.actionConfigurationMap.set('00384000', { action: DeIdentificationActionCodes.C });
        // Waveform Filter Description
        this.actionConfigurationMap.set('003A0329', { action: DeIdentificationActionCodes.C });

    }

    /**
     * The data set needs to be annotated that de-identification was applied
     */
    addAdditionalDeIdentificationRelatedTags() {
        this.additionalTagValuesMap.set(
            '00120062',
            this.patientIdentitityRemoved ? YesNoEnum.YES : YesNoEnum.NO
        );

        this.additionalTagValuesMap.set(
            '00280303',
            this.longitudinalTemporalInformationModified
        );

        this.additionalTagValuesMap.set(
            '00120063',
            'Per DICOM PS 3.15 AnnexE. RPB-Uploader v1.0'
        );

        // https://dicom.innolitics.com/ciods/enhanced-sr/patient/00120064/00080100
        // https://dicom.nema.org/medical/dicom/current/output/chtml/part16/chapter_8.html#chapter_8
        // https://dicom.nema.org/dicom/2013/output/chtml/part16/sect_CID_7050.html

        const deIdentificationStepsObject = [];
        for (let stepDescription of this.appliedDeIdentificationSteps) {
            const { codeMeaning, codeValue } = stepDescription;

            const deIdentificationMethodCodeSequence = {};

            deIdentificationMethodCodeSequence['00080102'] = {
                vr: DicomValueRepresentations.SH,
                Value: ['DCM']
            };

            deIdentificationMethodCodeSequence['00080104'] = {
                vr: DicomValueRepresentations.SH,
                Value: [codeMeaning]
            };

            if (codeValue.length > 16) {
                deIdentificationMethodCodeSequence['00080119'] = {
                    vr: DicomValueRepresentations.UC,
                    Value: [codeValue]
                };
            } else {
                deIdentificationMethodCodeSequence['00080100'] = {
                    vr: DicomValueRepresentations.SH,
                    Value: [codeValue]
                };
            }

            deIdentificationStepsObject.push(deIdentificationMethodCodeSequence);

        }

        this.additionalTagValuesMap.set('00120064', deIdentificationStepsObject);


    }

    addTrialSubjectTags() {
        // Clinical Trial Subject Module

        // ClinicalTrialProtocolID
        if (this.uploadSlot.studyIdentifier != undefined) {
            this.additionalTagValuesMap.set('00120020', this.uploadSlot.studyIdentifier);
        }
        // ClinicalTrialSiteID
        if (this.uploadSlot.siteIdentifier != undefined) {
            this.additionalTagValuesMap.set('00120030', this.uploadSlot.siteIdentifier);
        }
        // ClinicalTrialSubjectID
        if (this.uploadSlot.subjectId != undefined) {
            this.additionalTagValuesMap.set('00120040', this.uploadSlot.subjectId);
        }
    }

    addReferingPhysicianReplacementTag() {
        if (this.uploadSlot.studyEdcCode != null && this.uploadSlot.subjectId != null) {
            this.additionalTagValuesMap.set(
                '00080090',
                `(${this.uploadSlot.studyEdcCode})-${this.uploadSlot.subjectId}`
            );
        }

    }

    addPatientNameAndIdReplacementTags() {
        // The patient name and patient Id will be replaced by the PID (pseudonym of the specific patient)
        if (this.uploadSlot.pid != undefined) {
            // PatientName
            this.additionalTagValuesMap.set('00100010', this.uploadSlot.pid);
            // PatientID
            this.additionalTagValuesMap.set('00100020', this.uploadSlot.pid);
        }
    }

    getConfiguration() {
        return new DeIdentificationConfiguration(
            this.actionConfigurationMap,
            this.defaultReplacementsValuesMap,
            this.tagSpecificReplacementsValuesMap,
            this.additionalTagValuesMap,
            this.uploadSlot
        );
    }
}
