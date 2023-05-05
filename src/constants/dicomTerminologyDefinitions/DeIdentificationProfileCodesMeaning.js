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
  BASIC: "Basic Application Confidentiality Profile", // Basic Application Confidentiality Profile
  RETAIN_LONG_FULL_DATES: " Retain Longitudinal Temporal Information Full Dates Option", // Retain Longitudinal Temporal Information Full Dates Option
  RETAIN_PATIENT_CHARACTERISTICS: "Retain Patient Characteristics Option", // Retain Patient Characteristics Option
  RETAIN_DEVICE_IDENTITY: "Retain Device Identity Option", // Retain Device Identity Option
  CLEAN_DESCRIPTORS: "Clean Descriptors Option", // Clean Descriptors Option
  CLEAN_STRUCTURED_CONTENT: "Clean Structured Content Option", // Clean Structured Content Option
});
