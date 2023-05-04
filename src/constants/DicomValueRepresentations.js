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

// https://dicom.nema.org/dicom/2013/output/chtml/part05/sect_6.2.html

module.exports = Object.freeze({
  AE: "AE", // Application Entity
  AS: "AS", // Age String
  AT: "AT", // Attribute Tag
  CS: "CS", // Code String
  DA: "DA", // Date
  DS: "DS", // Decimal String
  DT: "DT", // Date Time
  FL: "FL", // Floating Point Single
  FD: "FD", // Floating Point Double
  IS: "IS", // Integer String
  LO: "LO", // Long String
  LT: "LT", // Long Text
  OB: "OB", // Other Byte String
  OD: "OD", // Other Double String
  OF: "OF", // Other Float String
  OW: "OW", // Other Word String
  PN: "PN", // Person Name
  SH: "SH", // Short String
  SL: "SL", //  Signed Long
  SQ: "SQ", // Sequence of Items
  SS: "SS", // Signed Short
  ST: "ST", // Short Text
  TM: "TM", // Time
  UI: "UI", // Unique Identifier UID
  UL: "UL", // Unsigned Long
  UN: "UN", // Unknown
  US: "US", // Unsigned Short
  UT: "UT", // Unlimited Text
});
