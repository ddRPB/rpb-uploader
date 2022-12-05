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

export const ALREADY_KNOWN_STUDY = {
    key: 'ALREADY_KNOWN_STUDY',
    content: 'This study is already known by the server.',
    ignorable: false
}

export const NULL_SLOT_ID = {
    key: 'NULL_SLOT_ID',
    content: 'You need to select/check the patient.',
    ignorable: false
}

export const MISSING_TAG_00080060 = {
    key: 'MISSING_TAG_00080060',
    content: 'Missing tag: Modality',
    ignorable: true,
    dismissed: false
}
