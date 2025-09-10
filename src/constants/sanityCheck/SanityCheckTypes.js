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

module.exports = Object.freeze({
  // Study Level
  STUDY_DATE_IS_CONSISTENT: "STUDY_DATE_IS_CONSISTENT",
  STUDY_DESCRIPTION_IS_CONSISTENT: "STUDY_DESCRIPTION_IS_CONSISTENT",
  // Patient
  PATIENT_ID_IS_CONSISTENT: "PATIENT_ID_IS_CONSISTENT",
  PATIENT_BIRTH_DATE_IS_CONSISTENT: "PATIENT_BIRTH_DATE_IS_CONSISTENT",
  PATIENT_GENDER_IS_CONSISTENT: "PATIENT_GENDER_IS_CONSISTENT",
  PATIENT_NAME_IS_CONSISTENT: "PATIENT_NAME_IS_CONSISTENT",
  // Upload Slot
  PATIENT_BIRTH_DATE_MATCHES_UPLOADSLOT: "PATIENT_BIRTH_DATE_MATCHES_UPLOADSLOT",
  PATIENT_BIRTH_YEAR_MATCHES_UPLOADSLOT: "PATIENT_BIRTH_YEAR_MATCHES_UPLOADSLOT",
  PATIENT_GENDER_MATCHES_UPLOADSLOT: "PATIENT_GENDER_MATCHES_UPLOADSLOT",
  // SOP Class
  SOP_CLASS_SUPPORTED: "SOP_CLASS_SUPPORTED",
});
