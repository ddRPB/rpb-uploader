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
    // Dicom data parameter in relation to upload slot parameter
    NOT_DEFINED_IN_UPLOADSLOT: 'Not defined in Upload Slot', // Upload slot property is not defined
    NOT_DEFINED_IN_STUDYPROPERTY: 'Not defined in Study Property', // Study property is not defined
    REPLACEMENT: 'Replacement',  // Parameter or upload slot definition is already a replacement
    CONFLICT: 'Conflict', // The upload slot definition does not fit to the parameter -> user needs to decide
    MATCHES: 'Match',  // The upload slot definition fits to the parameter
    ONE_MATCHES: 'One parameter matches', // Property is not consistent in all files and one of the properties matches the upload slot
})