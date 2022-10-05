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

/**
 * https://dicom.nema.org/medical/dicom/current/output/html/part16.html#DCM_113100
 * https://dicom.nema.org/medical/dicom/current/output/html/part15.html#table_E.1-1 
 */

module.exports = Object.freeze({
    BASIC: '113100', // Basic Application Confidentiality Profile
    RETAIN_LONG_FULL_DATES: ' 113106', // Retain Longitudinal Temporal Information Full Dates Option
    RETAIN_PATIENT_CHARACTERISTICS: '113108', // Retain Patient Characteristics Option
    RETAIN_DEVICE_IDENTITY: '113109', // Retain Device Identity Option
    CLEAN_DESCRIPTORS: '113105' // Clean Descriptors Option
})