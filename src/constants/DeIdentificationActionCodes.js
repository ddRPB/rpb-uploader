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
 * The DICOM standard defines profile attributes for the de-identification.
 * This object provides the codes. There are small modifications in the 
 * RPB context. That is reflected in additional codes that are not part of the standard.
 * 
 */
module.exports = Object.freeze({
    // DICOM standard action codes
    D: 'D', // replace with a non-zero-length (dummy) value
    Z: 'Z', // replace with a zero-length value if the original is a zero-length value or a non-zero (dummy) value
    X: 'X', // remove
    K: 'K', // keep
    C: 'C', // clean - replace with values of similar meaning without identifying information
    U: 'U',  // replace with a non-zero length uid - internally consistent within a set of instances
    // RPB specific action codes
    KP: 'KP' // keep with prefix

})