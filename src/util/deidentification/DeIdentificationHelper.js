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
 * Some deidentification tasks are defined for a specific range of DICOM tags. 
 * This function returns a defined String per group if the tag is part of it.
 * That helps to keep the configuration for the approriate deidentification task readable.
 */
function replaceContingentsWithMaskedNumberTag(tag) {
    if (tag.startsWith('50')) {
        return '50xxxxxx';
    }

    if (tag.startsWith('60') && tag.endsWith('3000')) {
        return '60xx3000';
    }

    if (tag.startsWith('60') && tag.endsWith('4000')) {
        return '60xx4000';
    }
    // nothing matches - return the input tag
    return tag;
}

/**
 * This function replaces all matching 'private' tags with the tag 'private'.
 * 
 * Private tags are part of the DICOM standard.
 * https://dicom.nema.org/dicom/2013/output/chtml/part05/sect_7.8.html
 */
function replacePrivateTagsWithStringPrivate(tag) {
    const group = tag.slice(0, 4);

    if (group > 7 && group % 2 == 1) {
        return 'private';
    }

    return tag;
}

export { replaceContingentsWithMaskedNumberTag, replacePrivateTagsWithStringPrivate };

