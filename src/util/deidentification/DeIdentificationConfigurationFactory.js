import DeIdentificationActionCodes from "../../constants/DeIdentificationActionCodes";
import DeIdentificationProfiles from "../../constants/DeIdentificationProfiles";
import DeIdentificationConfiguration from "./DeidentificationConfiguration";

// https://www.dicomstandard.org/News-dir/ftsup/docs/sups/sup142.pdf

export default class DeIdentificationConfigurationFactory {

    constructor(profile) {
        this.configurationMap = new Map();
        this.createBasicProfile();

        switch (profile) {
            case DeIdentificationProfiles.BASIC:
                //do nothing
                break;
            case DeIdentificationProfiles.RETAIN_DEVICE_IDENTITY:
                this.createRetainDeviceIdentityProfile();
                break;
            default:
                throw new Error(`Profile "${profile}" does not exist.`);

        }
    }

    createBasicProfile() {
        // Accession Number 
        this.configurationMap.set('00080050', { action: DeIdentificationActionCodes.Z });
        // Acquisition Comments
        this.configurationMap.set('00184000', { action: DeIdentificationActionCodes.X });
        // Acquisition Context Sequence
        this.configurationMap.set('00400555', { action: DeIdentificationActionCodes.X });
        // Acquisition Date
        this.configurationMap.set('00080022', { action: DeIdentificationActionCodes.X });
        // Acquisition DateTime
        this.configurationMap.set('0008002A', { action: DeIdentificationActionCodes.X });
        // Acquisition Device Processing Description
        this.configurationMap.set('00181400', { action: DeIdentificationActionCodes.X });
        // Acquisition Protocol Description
        this.configurationMap.set('00189424', { action: DeIdentificationActionCodes.X });
        // Acquisition Time
        this.configurationMap.set('00080032', { action: DeIdentificationActionCodes.X });
        // Actual Human Performers Sequence
        this.configurationMap.set('00404035', { action: DeIdentificationActionCodes.X });
        // Additional Patientʼs History
        this.configurationMap.set('001021B0', { action: DeIdentificationActionCodes.X });
        // Admission ID
        this.configurationMap.set('00380010', { action: DeIdentificationActionCodes.X });
        // Admitting Date
        this.configurationMap.set('00380020', { action: DeIdentificationActionCodes.X });
        // Admitting Diagnoses Code Sequence
        this.configurationMap.set('00081084', { action: DeIdentificationActionCodes.X });
        // Admitting Diagnoses Description
        this.configurationMap.set('00081080', { action: DeIdentificationActionCodes.X });
        // Admitting Time
        this.configurationMap.set('00380021', { action: DeIdentificationActionCodes.X });
        // Affected SOP Instance UID
        this.configurationMap.set('00001000', { action: DeIdentificationActionCodes.X });
        // Allergies
        this.configurationMap.set('00102110', { action: DeIdentificationActionCodes.X });
        // Arbitrary 
        this.configurationMap.set('40000010', { action: DeIdentificationActionCodes.X });
        // Author Observer Sequence
        this.configurationMap.set('0040A078', { action: DeIdentificationActionCodes.X });
        // Branch of Service
        this.configurationMap.set('00101081', { action: DeIdentificationActionCodes.X });
        // Cassette ID
        this.configurationMap.set('00181007', { action: DeIdentificationActionCodes.X });
        // Comments on Performed Procedure Step
        this.configurationMap.set('00400280', { action: DeIdentificationActionCodes.X });
        // Concatenation UID
        this.configurationMap.set('00209161', { action: DeIdentificationActionCodes.U });
        // Confidentiality Constraint on Patient Data Description
        this.configurationMap.set('00403001', { action: DeIdentificationActionCodes.X });
        // Content Creator`s Name
        this.configurationMap.set('00700084', { action: DeIdentificationActionCodes.Z });
        // Content Creator`s Identification Code Sequence
        this.configurationMap.set('00700086', { action: DeIdentificationActionCodes.X });
        // Content Date
        this.configurationMap.set('00080023', { action: DeIdentificationActionCodes.D });
        // Content Sequence
        this.configurationMap.set('0040A730', { action: DeIdentificationActionCodes.X });
        // Content Time
        this.configurationMap.set('00080033', { action: DeIdentificationActionCodes.D });
        // Context Group Extension Creator UID
        this.configurationMap.set('0008010D', { action: DeIdentificationActionCodes.U });
        // Contrast Bolus Agent
        this.configurationMap.set('00180010', { action: DeIdentificationActionCodes.D });
        // Contribution Description
        this.configurationMap.set('0018A003', { action: DeIdentificationActionCodes.X });
        // Coutry of Residence
        this.configurationMap.set('00102150', { action: DeIdentificationActionCodes.X });
        // Creator Version UID
        this.configurationMap.set('00089123', { action: DeIdentificationActionCodes.U });
        // Current Patient Location
        this.configurationMap.set('00380300', { action: DeIdentificationActionCodes.X });
        // Curve Data
        this.configurationMap.set('50xxxxxx', { action: DeIdentificationActionCodes.X });
        // Curve Date
        this.configurationMap.set('00080025', { action: DeIdentificationActionCodes.X });
        // Curve Time
        this.configurationMap.set('00080035', { action: DeIdentificationActionCodes.X });
        // Custodial Organization Sequence
        this.configurationMap.set('0040A07C', { action: DeIdentificationActionCodes.X });
        // Data Set Trailing Padding
        this.configurationMap.set('FFFCFFFC', { action: DeIdentificationActionCodes.X });
        // Derivation Description
        this.configurationMap.set('00082111', { action: DeIdentificationActionCodes.X });
        // Detector ID
        this.configurationMap.set('0018700A', { action: DeIdentificationActionCodes.X });
        // Device Serial Number
        this.configurationMap.set('00181000', { action: DeIdentificationActionCodes.D });
        // Device UID
        this.configurationMap.set('00181002', { action: DeIdentificationActionCodes.U });
        // Digital Signature UID
        this.configurationMap.set('04000100', { action: DeIdentificationActionCodes.X });
        // Digital Signatures Sequence
        this.configurationMap.set('FFFAFFFA', { action: DeIdentificationActionCodes.X });
        // Dimension Organization UID
        this.configurationMap.set('00209164', { action: DeIdentificationActionCodes.U });
        // Discharge Diagnosis Description
        this.configurationMap.set('00380040', { action: DeIdentificationActionCodes.X });
        // Distribution Address
        this.configurationMap.set('4008011A', { action: DeIdentificationActionCodes.X });
        // Distribution Name
        this.configurationMap.set('40080119', { action: DeIdentificationActionCodes.X });
        // Dose Reference UID
        this.configurationMap.set('300A0013', { action: DeIdentificationActionCodes.U });
        // Ethnic Group
        this.configurationMap.set('00102160', { action: DeIdentificationActionCodes.X });
        // Failed SOP Instance UID List
        this.configurationMap.set('00080058', { action: DeIdentificationActionCodes.U });
        // Fiducial UID
        this.configurationMap.set('0070031A', { action: DeIdentificationActionCodes.U });
        // Filler Order Number of Imaging Service Request
        this.configurationMap.set('00402017', { action: DeIdentificationActionCodes.Z });
        // Frame Comments
        this.configurationMap.set('00209158', { action: DeIdentificationActionCodes.X });
        // Frame of Reference UID
        this.configurationMap.set('00200052', { action: DeIdentificationActionCodes.U });
        // Gantry ID
        this.configurationMap.set('00181008', { action: DeIdentificationActionCodes.X });
        // Generator ID
        this.configurationMap.set('00181005', { action: DeIdentificationActionCodes.X });
        // Graphic Annotation Sequence
        this.configurationMap.set('00700001', { action: DeIdentificationActionCodes.D });
        // Human Performers Name
        this.configurationMap.set('00404037', { action: DeIdentificationActionCodes.X });
        // Human Performers Organization
        this.configurationMap.set('00404036', { action: DeIdentificationActionCodes.X });
        // Icon Image Sequence
        this.configurationMap.set('00880200', { action: DeIdentificationActionCodes.X });
        // Identifying Comments
        this.configurationMap.set('00084000', { action: DeIdentificationActionCodes.X });
        // Image Comments
        this.configurationMap.set('00204000', { action: DeIdentificationActionCodes.X });
        // Image Presentation Comments
        this.configurationMap.set('00284000', { action: DeIdentificationActionCodes.X });
        // Imaging Service Request Comments
        this.configurationMap.set('00402400', { action: DeIdentificationActionCodes.X });
        // Impressions
        this.configurationMap.set('40080300', { action: DeIdentificationActionCodes.X });
        // Instance Creator UID
        this.configurationMap.set('00080014', { action: DeIdentificationActionCodes.U });
        // Institution Address
        this.configurationMap.set('00080081', { action: DeIdentificationActionCodes.X });
        // Institution Code Sequence
        this.configurationMap.set('00080082', { action: DeIdentificationActionCodes.D });
        // Institution Name
        this.configurationMap.set('00080080', { action: DeIdentificationActionCodes.D });
        // Institutional Department Name
        this.configurationMap.set('00081040', { action: DeIdentificationActionCodes.X });
        // Insurance Plan Identification
        this.configurationMap.set('00101050', { action: DeIdentificationActionCodes.X });
        // Intended Recipients of Results Identification Sequence
        this.configurationMap.set('00401011', { action: DeIdentificationActionCodes.X });
        // Interpretation Approver Sequence
        this.configurationMap.set('40080111', { action: DeIdentificationActionCodes.X });
        // Interpretation Author
        this.configurationMap.set('4008010C', { action: DeIdentificationActionCodes.X });
        // Interpretation Diagnosis Description
        this.configurationMap.set('40080115', { action: DeIdentificationActionCodes.X });
        // Interpretation ID Issuer
        this.configurationMap.set('40080202', { action: DeIdentificationActionCodes.X });
        // Interpretation Recorder
        this.configurationMap.set('40080102', { action: DeIdentificationActionCodes.X });
        // Interpretation Text
        this.configurationMap.set('4008010B', { action: DeIdentificationActionCodes.X });
        // Interpretation Transcriber
        this.configurationMap.set('4008010A', { action: DeIdentificationActionCodes.X });
        // Irradiation Event UID
        this.configurationMap.set('00083010', { action: DeIdentificationActionCodes.U });
        // Issuer of Admission ID
        this.configurationMap.set('00380011', { action: DeIdentificationActionCodes.X });
        // Issuer of Patient ID
        this.configurationMap.set('00100021', { action: DeIdentificationActionCodes.X });
        // Issuer of Service Episode ID
        this.configurationMap.set('00380061', { action: DeIdentificationActionCodes.X });
        // Large Palette Color Lookup Table UID
        this.configurationMap.set('00281214', { action: DeIdentificationActionCodes.U });
        // Last Menstrual Date
        this.configurationMap.set('001021D0', { action: DeIdentificationActionCodes.X });
        // MAC
        this.configurationMap.set('04000404', { action: DeIdentificationActionCodes.X });
        // Media Storage SOP Instance UID
        this.configurationMap.set('00020003', { action: DeIdentificationActionCodes.U });
        // Medical Alerts
        this.configurationMap.set('00102000', { action: DeIdentificationActionCodes.X });
        // Medical Record Locator
        this.configurationMap.set('00101090', { action: DeIdentificationActionCodes.X });
        // Military Rank
        this.configurationMap.set('00101080', { action: DeIdentificationActionCodes.X });
        // Modified Attributes Sequence
        this.configurationMap.set('04000550', { action: DeIdentificationActionCodes.X });
        // Modified Image Description
        this.configurationMap.set('00203406', { action: DeIdentificationActionCodes.X });
        // Modifying Device ID
        this.configurationMap.set('00203401', { action: DeIdentificationActionCodes.X });
        // Modifying Device Manufacturer
        this.configurationMap.set('00203404', { action: DeIdentificationActionCodes.X });
        // Name of Physician(s) Reading Study
        this.configurationMap.set('00081060', { action: DeIdentificationActionCodes.X });
        // Names of Intended Recipient of Results
        this.configurationMap.set('00401010', { action: DeIdentificationActionCodes.X });
        // Occupation
        this.configurationMap.set('00102180', { action: DeIdentificationActionCodes.X });
        // Operatorsʼ Identification Sequence
        this.configurationMap.set('00081072', { action: DeIdentificationActionCodes.D });
        // Operatorsʼ Name
        this.configurationMap.set('00081070', { action: DeIdentificationActionCodes.D });
        // Original Attributes Sequence
        this.configurationMap.set('04000561', { action: DeIdentificationActionCodes.X });
        // Order Callback Phone Number
        this.configurationMap.set('00402010', { action: DeIdentificationActionCodes.X });
        // Order Entered By
        this.configurationMap.set('00402008', { action: DeIdentificationActionCodes.X });
        // Order Enterer Location
        this.configurationMap.set('00402009', { action: DeIdentificationActionCodes.X });
        // Other Patient IDs
        this.configurationMap.set('00101000', { action: DeIdentificationActionCodes.X });
        // Other Patient IDs Sequence
        this.configurationMap.set('00101002', { action: DeIdentificationActionCodes.X });
        // Other Patient Names
        this.configurationMap.set('00101001', { action: DeIdentificationActionCodes.X });
        // Overlay Comments
        this.configurationMap.set('60xx4000', { action: DeIdentificationActionCodes.X });
        // Overlay Data
        this.configurationMap.set('60xx3000', { action: DeIdentificationActionCodes.X });
        // Overlay Date
        this.configurationMap.set('00080024', { action: DeIdentificationActionCodes.X });
        // Overlay Time
        this.configurationMap.set('00080034', { action: DeIdentificationActionCodes.X });
        // Palette Color Lookup Table UID
        this.configurationMap.set('00281199', { action: DeIdentificationActionCodes.U });
        // Participant Sequence
        this.configurationMap.set('0040A07A', { action: DeIdentificationActionCodes.X });
        // Patient Address
        this.configurationMap.set('00101040', { action: DeIdentificationActionCodes.X });
        // Patient Comments
        this.configurationMap.set('00104000', { action: DeIdentificationActionCodes.X });
        // Patient ID
        this.configurationMap.set('00100020', { action: DeIdentificationActionCodes.Z });
        // Patient Sex Neutered
        this.configurationMap.set('00102203', { action: DeIdentificationActionCodes.D });
        // Patient State
        this.configurationMap.set('00380500', { action: DeIdentificationActionCodes.X });
        // Patient Transport Arrangements
        this.configurationMap.set('00401004', { action: DeIdentificationActionCodes.X });
        // Patientʼs Age
        this.configurationMap.set('00101010', { action: DeIdentificationActionCodes.X });
        // Patientʼs Birth Date
        this.configurationMap.set('00100030', { action: DeIdentificationActionCodes.Z });
        // Patientʼs Birth Name
        this.configurationMap.set('00101005', { action: DeIdentificationActionCodes.X });
        // Patientʼs Birth Time
        this.configurationMap.set('00100032', { action: DeIdentificationActionCodes.X });
        // Patientʼs Institution Reside 
        this.configurationMap.set('00380400', { action: DeIdentificationActionCodes.X });
        // Patientʼs Insurance Plan Code Sequence
        this.configurationMap.set('00100050', { action: DeIdentificationActionCodes.X });
        // Patientʼs Motherʼs Birth Name
        this.configurationMap.set('00101060', { action: DeIdentificationActionCodes.X });
        // Patientʼs Name
        this.configurationMap.set('00100010', { action: DeIdentificationActionCodes.Z });
        // Patientʼs Primary Language Code Sequence
        this.configurationMap.set('00100101', { action: DeIdentificationActionCodes.X });
        // Patientʼs Primary Language Modifier Code Sequence
        this.configurationMap.set('00100102', { action: DeIdentificationActionCodes.X });
        // Patientʼs Religious Preference
        this.configurationMap.set('001021F0', { action: DeIdentificationActionCodes.X });
        // Patientʼs Sex
        this.configurationMap.set('00100040', { action: DeIdentificationActionCodes.Z });
        // Patientʼs Size 
        this.configurationMap.set('00101020', { action: DeIdentificationActionCodes.X });
        // Patientʼs Telephone Number 
        this.configurationMap.set('00102154', { action: DeIdentificationActionCodes.X });
        // Patientʼs Weight
        this.configurationMap.set('00101030', { action: DeIdentificationActionCodes.X });
        // Performed Location
        this.configurationMap.set('00400243', { action: DeIdentificationActionCodes.X });
        // Performed Procedure Step Description
        this.configurationMap.set('00400254', { action: DeIdentificationActionCodes.X });
        // Performed Procedure Step ID
        this.configurationMap.set('00400253', { action: DeIdentificationActionCodes.X });
        // Performed Procedure Step Start Date
        this.configurationMap.set('00400244', { action: DeIdentificationActionCodes.X });
        // Performed Procedure Step Start Time
        this.configurationMap.set('00400245', { action: DeIdentificationActionCodes.X });
        // Performed Station AE Title
        this.configurationMap.set('00400241', { action: DeIdentificationActionCodes.X });
        // Performed Station Geographic Location Code Sequence
        this.configurationMap.set('00404030', { action: DeIdentificationActionCodes.X });
        // Performed Station Name
        this.configurationMap.set('00400242', { action: DeIdentificationActionCodes.X });
        // Performed Station Name Code Sequence
        this.configurationMap.set('00400248', { action: DeIdentificationActionCodes.X });
        // Performing Physiciansʼ Identification Sequence
        this.configurationMap.set('00081052', { action: DeIdentificationActionCodes.X });
        // Performing Physiciansʼ Name
        this.configurationMap.set('00081050', { action: DeIdentificationActionCodes.X });
        // Person Address
        this.configurationMap.set('00401102', { action: DeIdentificationActionCodes.X });
        // Person Identification Code Sequence
        this.configurationMap.set('00401101', { action: DeIdentificationActionCodes.D });
        // Person Name
        this.configurationMap.set('0040A123', { action: DeIdentificationActionCodes.D });
        // Person Telephone Numbers
        this.configurationMap.set('00401103', { action: DeIdentificationActionCodes.X });
        // Physician Approving Interpretation
        this.configurationMap.set('40080114', { action: DeIdentificationActionCodes.X });
        // Physician Reading Study Identification Sequence
        this.configurationMap.set('00081062', { action: DeIdentificationActionCodes.X });
        // Physician(s) of Record
        this.configurationMap.set('00081048', { action: DeIdentificationActionCodes.X });
        // Physician(s) of Record Identification Sequence
        this.configurationMap.set('00081049', { action: DeIdentificationActionCodes.X });
        // Placer Order Number of Imaging Service Request
        this.configurationMap.set('00402016', { action: DeIdentificationActionCodes.Z });
        // Plate ID
        this.configurationMap.set('00181004', { action: DeIdentificationActionCodes.X });
        // Pre-Medication
        this.configurationMap.set('00400012', { action: DeIdentificationActionCodes.X });
        // Pregnancy Status
        this.configurationMap.set('001021C0', { action: DeIdentificationActionCodes.X });
        // Private attributes
        this.configurationMap.set('private', { action: DeIdentificationActionCodes.X });
        // Protocol Name
        this.configurationMap.set('00181030', { action: DeIdentificationActionCodes.D });
        // Reason for Imaging Service Request
        this.configurationMap.set('00402001', { action: DeIdentificationActionCodes.X });
        // Reason for Study
        this.configurationMap.set('00321030', { action: DeIdentificationActionCodes.X });
        // Referenced Digital Signature Sequence
        this.configurationMap.set('04000402', { action: DeIdentificationActionCodes.X });
        // Referenced Frame of Reference UID
        this.configurationMap.set('30060024', { action: DeIdentificationActionCodes.U });
        // Referenced General Purpose Scheduled Procedure Step Transaction UID
        this.configurationMap.set('00404023', { action: DeIdentificationActionCodes.U });
        // Referenced Image Sequence
        this.configurationMap.set('00081140', { action: DeIdentificationActionCodes.U });
        // Referenced Patient Alias Sequence
        this.configurationMap.set('00381234', { action: DeIdentificationActionCodes.X });
        // Referenced Patient Sequence
        this.configurationMap.set('00081120', { action: DeIdentificationActionCodes.X });
        // Referenced Performed Procedure Step Sequence
        this.configurationMap.set('00081111', { action: DeIdentificationActionCodes.X });
        // Referenced SOP Instance MAC Sequence
        this.configurationMap.set('04000403', { action: DeIdentificationActionCodes.X });
        // Referenced SOP Instance UID
        this.configurationMap.set('00081155', { action: DeIdentificationActionCodes.U });
        // Referenced SOP Instance UID in File
        this.configurationMap.set('00041511', { action: DeIdentificationActionCodes.U });
        // Referenced Study Sequence
        this.configurationMap.set('00081110', { action: DeIdentificationActionCodes.X });
        // Referring Physicianʼs Address
        this.configurationMap.set('00080092', { action: DeIdentificationActionCodes.X });
        // Referring Physicianʼs Identification Sequence
        this.configurationMap.set('00080096', { action: DeIdentificationActionCodes.X });
        // Referring Physicianʼs Name
        this.configurationMap.set('00080090', { action: DeIdentificationActionCodes.Z });
        // Referring Physicianʼs Telephone Numbers
        this.configurationMap.set('00080094', { action: DeIdentificationActionCodes.X });
        // Region of Residence
        this.configurationMap.set('00102152', { action: DeIdentificationActionCodes.X });
        // Related Frame of Reference UID
        this.configurationMap.set('300600C2', { action: DeIdentificationActionCodes.U });
        // Request Attributes Sequence
        this.configurationMap.set('00400275', { action: DeIdentificationActionCodes.X });
        // Requested Contrast Agent
        this.configurationMap.set('00321070', { action: DeIdentificationActionCodes.X });
        // Requested Procedure Comments
        this.configurationMap.set('00401400', { action: DeIdentificationActionCodes.X });
        // Requested Procedure Descript 
        this.configurationMap.set('00321060', { action: DeIdentificationActionCodes.X });
        // Requested Procedure ID 
        this.configurationMap.set('00401001', { action: DeIdentificationActionCodes.X });
        // Requested Procedure Location 
        this.configurationMap.set('00401005', { action: DeIdentificationActionCodes.X });
        // Requested SOP Instance UID
        this.configurationMap.set('00001001', { action: DeIdentificationActionCodes.U });
        // Requesting Physician
        this.configurationMap.set('00321032', { action: DeIdentificationActionCodes.X });
        // Requesting Service
        this.configurationMap.set('00321033', { action: DeIdentificationActionCodes.X });
        // Responsible Organization
        this.configurationMap.set('00102299', { action: DeIdentificationActionCodes.X });
        // Responsible Person
        this.configurationMap.set('00102297', { action: DeIdentificationActionCodes.X });
        // Results Comments
        this.configurationMap.set('40084000', { action: DeIdentificationActionCodes.X });
        // Results Distribution List Sequence
        this.configurationMap.set('40080118', { action: DeIdentificationActionCodes.X });
        // Results ID Issuer
        this.configurationMap.set('300E0008', { action: DeIdentificationActionCodes.Z });
        // Scheduled Human Performers Sequence
        this.configurationMap.set('00404034', { action: DeIdentificationActionCodes.X });
        // Scheduled Patient Institution Residence
        this.configurationMap.set('0038001E', { action: DeIdentificationActionCodes.X });
        // Scheduled Performing Physician Identification Sequence
        this.configurationMap.set('0040000B', { action: DeIdentificationActionCodes.X });
        // Scheduled Performing Physician Name
        this.configurationMap.set('00400006', { action: DeIdentificationActionCodes.X });
        // Scheduled Procedure Step End Date 
        this.configurationMap.set('00400004', { action: DeIdentificationActionCodes.X });
        // Scheduled Procedure Step End Time 
        this.configurationMap.set('00400005', { action: DeIdentificationActionCodes.X });
        // Scheduled Procedure Step Description 
        this.configurationMap.set('00400007', { action: DeIdentificationActionCodes.X });
        // Scheduled Procedure Step Location
        this.configurationMap.set('00400011', { action: DeIdentificationActionCodes.X });
        // Scheduled Procedure Step Start Date
        this.configurationMap.set('00400002', { action: DeIdentificationActionCodes.X });
        // Scheduled Procedure Step Start Time
        this.configurationMap.set('00400003', { action: DeIdentificationActionCodes.X });
        // Scheduled Station AE Title
        this.configurationMap.set('00400001', { action: DeIdentificationActionCodes.X });
        // Scheduled Station Geographic Location Code Sequence
        this.configurationMap.set('00404027', { action: DeIdentificationActionCodes.X });
        // Scheduled Station Name
        this.configurationMap.set('00400010', { action: DeIdentificationActionCodes.X });
        // Scheduled Station Name Code Sequence
        this.configurationMap.set('00404025', { action: DeIdentificationActionCodes.X });
        // Scheduled Study Location
        this.configurationMap.set('00321020', { action: DeIdentificationActionCodes.X });
        // Scheduled Study Location AE Title
        this.configurationMap.set('00321021', { action: DeIdentificationActionCodes.X });
        // Series Date
        this.configurationMap.set('00080021', { action: DeIdentificationActionCodes.D });
        // Series Description
        this.configurationMap.set('0008103E', { action: DeIdentificationActionCodes.X });
        // Series Instance UID
        this.configurationMap.set('0020000E', { action: DeIdentificationActionCodes.U });
        // Series Time
        this.configurationMap.set('00080031', { action: DeIdentificationActionCodes.D });
        // Service Episode Description
        this.configurationMap.set('00380062', { action: DeIdentificationActionCodes.X });
        // Service Episode ID
        this.configurationMap.set('00380060', { action: DeIdentificationActionCodes.X });
        // Smoking Status
        this.configurationMap.set('001021A0', { action: DeIdentificationActionCodes.X });
        // SOP Instance UID
        this.configurationMap.set('00080018', { action: DeIdentificationActionCodes.U });
        // Source Image Sequence
        this.configurationMap.set('00082112', { action: DeIdentificationActionCodes.X });
        // Special Needs
        this.configurationMap.set('00380050', { action: DeIdentificationActionCodes.X });
        // Station Name
        this.configurationMap.set('00380050', { action: DeIdentificationActionCodes.D });
        // Storage Media Fileset UID
        this.configurationMap.set('00880140', { action: DeIdentificationActionCodes.U });
        // Study Comments
        this.configurationMap.set('00324000', { action: DeIdentificationActionCodes.X });
        // Study Date
        this.configurationMap.set('00080020', { action: DeIdentificationActionCodes.Z });
        // Study Description
        this.configurationMap.set('00081030', { action: DeIdentificationActionCodes.X });
        // Study ID
        this.configurationMap.set('00200010', { action: DeIdentificationActionCodes.Z });
        // Study ID Issuer
        this.configurationMap.set('00320012', { action: DeIdentificationActionCodes.X });
        // Study Instance UID
        this.configurationMap.set('0020000D', { action: DeIdentificationActionCodes.U });
        // Study Time
        this.configurationMap.set('00080030', { action: DeIdentificationActionCodes.Z });
        // Synchronization Frame of Reference UID
        this.configurationMap.set('00200200', { action: DeIdentificationActionCodes.U });
        // Template Extension Creator UID
        this.configurationMap.set('0040DB0D', { action: DeIdentificationActionCodes.U });
        // Template Extension Organization UID
        this.configurationMap.set('0040DB0C', { action: DeIdentificationActionCodes.U });
        // Text Comments
        this.configurationMap.set('40004000', { action: DeIdentificationActionCodes.X });
        // Text String
        this.configurationMap.set('20300020', { action: DeIdentificationActionCodes.X });
        // Timezone Offset From UTC 
        this.configurationMap.set('00080201', { action: DeIdentificationActionCodes.X });
        // Topic Author
        this.configurationMap.set('00880910', { action: DeIdentificationActionCodes.X });
        // Topic Key Words
        this.configurationMap.set('00880912', { action: DeIdentificationActionCodes.X });
        // Topic Subject 
        this.configurationMap.set('00880906', { action: DeIdentificationActionCodes.X });
        // Topic Title
        this.configurationMap.set('00880904', { action: DeIdentificationActionCodes.X });
        // Transaction UID
        this.configurationMap.set('00081195', { action: DeIdentificationActionCodes.U });
        // UID
        this.configurationMap.set('0040A124', { action: DeIdentificationActionCodes.U });
        // Verifying Observer Identification Code Sequence
        this.configurationMap.set('0040A088', { action: DeIdentificationActionCodes.Z });
        // Verifying Observer Name
        this.configurationMap.set('0040A075', { action: DeIdentificationActionCodes.D });
        // Verifying Observer Sequence
        this.configurationMap.set('0040A073', { action: DeIdentificationActionCodes.D });
        // Verifying Organization
        this.configurationMap.set('0040A027', { action: DeIdentificationActionCodes.X });
        // Visit Comments
        this.configurationMap.set('00384000', { action: DeIdentificationActionCodes.X });


    }

    createRetainDeviceIdentityProfile() {
        this.configurationMap.set('00181007', this.configurationMap.get('00181007').action = DeIdentificationActionCodes.K);
    }

    getConfiguration() {
        return new DeIdentificationConfiguration(this.configurationMap);
    }
}