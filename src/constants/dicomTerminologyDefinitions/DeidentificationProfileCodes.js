/**
 * https://dicom.nema.org/medical/dicom/current/output/html/part16.html#DCM_113100
 * https://dicom.nema.org/medical/dicom/current/output/html/part15.html#table_E.1-1 
 */

/ 

module.exports = Object.freeze({
    BASIC: '113100', // Basic Application Confidentiality Profile
    RETAIN_LONG_FULL_DATES: ' 113106', // Retain Longitudinal Temporal Information Full Dates Option
    RETAIN_PATIENT_CHARACTERISTICS: '113108', // Retain Patient Characteristics Option
    RETAIN_DEVICE_IDENTITY: '113109', // Retain Device Identity Option
    CLEAN_DESCRIPTORS: '113105' // Clean Descriptors Option
})