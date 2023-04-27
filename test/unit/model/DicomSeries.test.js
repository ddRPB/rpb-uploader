/*
 * This file is part of RadPlanBio
 * 
 * Copyright (C) 2013 - 2023 RPB Team
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

import DicomInstance from "../../../src/model/DicomInstance";
import DicomSeries from "../../../src/model/DicomSeries";

describe('DicomSeries Tests', () => {

    const referencedSopInstanceUids = new Set();

    const seriesDetails = {
        seriesInstanceUID: 'dummy-series-instance-uid',
        seriesDate: '',
        seriesDescription: 'dummy-series-description',
        modality: 'RTPLAN',
        studyInstanceUID: 'dummy-study-instance-uid',
        referencedSopInstanceUids: referencedSopInstanceUids,
    }

    const parsedParameters = new Map();
    const availableDicomTags = new Map();

    const dicomSeries = new DicomSeries(seriesDetails, parsedParameters, availableDicomTags);;

    describe('Instances and References', () => {
        test('getInstancesReferencesDetails and getReferencedInstancesUIDs ', () => {
            const fileObjectDetailsOne = {
                sopInstanceUID: 'dummy-uid-1',
                referencedSopInstanceUids: new Set(['dummy-uid-2']),
            };

            dicomSeries.addInstance(new DicomInstance(null, fileObjectDetailsOne));
            const fileObjectDetailsTwo = {
                sopInstanceUID: 'dummy-uid-3',
                referencedSopInstanceUids: new Set(['dummy-uid-2', 'dummy-uid-4']),
            };

            dicomSeries.addInstance(new DicomInstance(null, fileObjectDetailsTwo));
            const ref = dicomSeries.getInstancesReferencesDetails();
            const ref2 = dicomSeries.getReferencedInstancesUIDs();

            expect(dicomSeries.instanceExists('dummy-uid-1')).toBe(true);
            expect(dicomSeries.instanceExists('dummy-uid-3')).toBe(true);
            expect(dicomSeries.getSopInstancesUIDs().length).toBe(2);

        })
    })
})