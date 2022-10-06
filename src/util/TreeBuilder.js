
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

export default class TreeBuilder {
    rTStructs = {};
    rtPlans = {};
    rTDoses = {};
    rTImages = {};
    cTs = {};
    otherSeries = {};

    constructor(dicomStudyArray) {
        this.dicomStudyArray = dicomStudyArray;
    }

    getBasicSeriesNode(seriesObject) {
        const node = {};
        node.data = {};
        node.children = [];

        // key property for React
        node.key = seriesObject.getSeriesInstanceUID();
        node.data.modality = seriesObject.modality;
        node.data.seriesInstanceUID = seriesObject.getSeriesInstanceUID();
        node.data.seriesDate = seriesObject.getSeriesDate();
        node.data.seriesDescription = seriesObject.getSeriesDescription();
        node.data.studyInstanceUID = seriesObject.getStudyInstanceUID();
        node.data.instancesSize = seriesObject.getInstancesSize();

        return node;
    }

    buildAllNodesChildrenOfRoot() {
        this.buildSeriesNodesMaps();

        let result = {}
        result.root = [];

        for (let otherSeriesId in this.otherSeries) {
            const otherSeries = this.otherSeries[otherSeriesId];
            result.root.push(otherSeries);
        }

        for (let ctId in this.cTs) {
            const ctSeries = this.cTs[ctId];
            result.root.push(ctSeries);
        }

        for (let rtStructId in this.rTStructs) {
            const rTStruct = this.rTStructs[rtStructId];
            result.root.push(rTStruct);
        }

        for (let rtPlanId in this.rtPlans) {
            const rTPlan = this.rtPlans[rtPlanId];
            result.root.push(rTPlan);
        }


        for (let imageId in this.rTImages) {
            const rTImage = this.rTImages[imageId];
            result.root.push(rTImage);
        }

        for (let doseId in this.rTDoses) {
            const rTDose = this.rTDoses[doseId];
            result.root.push(rTDose);
        }

        return result;

    }

    build() {
        this.buildSeriesNodesMaps();

        this.result = {}
        this.result.root = [];

        for (let ctId in this.cTs) {
            const ctSeries = this.cTs[ctId];
            this.result.root.push(ctSeries);
        }

        for (let imageId in this.rTImages) {
            const rTImage = this.rTImages[imageId];
            const refSequence = rTImage["ReferencedRTPlanSequence"];
            for (let reference of refSequence) {
                const refSOPUID = reference.get("ReferencedSOPInstanceUID");
                if ((this.rtPlans[refSOPUID]) !== undefined) {
                    if (this.rtPlans[refSOPUID].children !== undefined) {
                        this.rtPlans[refSOPUID].children.push(rTImage);
                    }
                };
            }
        }

        for (let doseId in this.rTDoses) {
            const rTDose = this.rTDoses[doseId];
            const refSequence = rTDose["ReferencedRTPlanSequence"];
            for (let reference of refSequence) {
                const refSOPUID = reference.get("ReferencedSOPInstanceUID");
                if ((this.rtPlans[refSOPUID]) !== undefined) {
                    if (this.rtPlans[refSOPUID].children !== undefined) {
                        this.rtPlans[refSOPUID].children.push(rTDose);
                    }
                };
            }

        }

        for (let rtPlanId in this.rtPlans) {
            const rTPlan = this.rtPlans[rtPlanId];
            const refSequence = rTPlan["ReferencedStructureSetSequence"];
            for (let reference of refSequence) {
                const refSOPUID = reference.get("ReferencedSOPInstanceUID");
                if ((this.rTStructs[refSOPUID]) !== undefined) {
                    if (this.rTStructs[refSOPUID].children !== undefined) {
                        this.rTStructs[refSOPUID].children.push(rTPlan);
                    }
                };
            }
        }

        for (let rtStructId in this.rTStructs) {
            const rTStruct = this.rTStructs[rtStructId];
            const refSequence = rTStruct["ReferencedFrameOfReferenceSequence"];
            for (let frameOfReferenceItem of refSequence) {
                if (frameOfReferenceItem.get("RTReferencedStudySequence") !== undefined) {
                    for (let reference of frameOfReferenceItem.get("RTReferencedStudySequence")) {
                        const refSOPUID = reference.get("ReferencedSOPInstanceUID");
                        if ((this.cTs[refSOPUID]) !== undefined) {
                            if (this.cTs[refSOPUID].children !== undefined) {
                                this.cTs[refSOPUID].children.push(rTStruct);
                            }
                        } else {
                            for (let contourImage of reference.get("ContourImageSequence")) {
                                if ((this.cTs[contourImage.get("SeriesInstanceUID")]) !== undefined) {
                                    if (this.cTs[contourImage.get("SeriesInstanceUID")].children !== undefined) {
                                        this.cTs[contourImage.get("SeriesInstanceUID")].children.push(rTStruct);
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }



        return this.result;
    }

    getDetailsItem(name, value) {
        return {
            "name": name,
            "value": value
        }

    }


    buildSeriesNodesMaps() {
        this.rTStructs = {};
        this.rtPlans = {};
        this.rTDoses = {};
        this.rTImages = {};
        this.cTs = {};
        this.otherSeries = {};


        for (let studyObject of this.dicomStudyArray) {
            let series = studyObject.getSeriesArray();
            for (let seriesObject of series) {
                let modality = seriesObject.modality;
                switch (modality) {
                    case "RTSTRUCT":
                        const struct = this.getBasicSeriesNode(seriesObject);
                        struct.data.SOPInstanceUID = seriesObject.parameters.get("SOPInstanceUID");
                        struct.data.StudyInstanceUID = seriesObject.parameters.get("StudyInstanceUID");
                        struct.data.StructureSetLabel = seriesObject.parameters.get("StructureSetLabel");
                        struct.data.StudyDescription = seriesObject.parameters.get("StudyDescription");
                        struct.data.StructureSetName = seriesObject.parameters.get("StructureSetName");
                        struct.data.StructureSetDescription = seriesObject.parameters.get("StructureSetDescription");

                        if (struct.data.seriesDescription === "") {
                            if (seriesObject.parameters.get("StructureSetDescription") !== undefined && seriesObject.parameters.get("StructureSetDescription") !== "") {
                                struct.data.seriesDescription = seriesObject.parameters.get("StructureSetDescription");
                            } else if (seriesObject.parameters.get("StructureSetLabel") !== undefined && seriesObject.parameters.get("StructureSetLabel") !== "") {
                                struct.data.seriesDescription = seriesObject.parameters.get("StructureSetLabel");
                            } else if (seriesObject.parameters.get("StructureSetName") !== undefined && seriesObject.parameters.get("StructureSetName") !== "") {
                                struct.data.seriesDescription = seriesObject.parameters.get("StructureSetName");
                            }
                        }

                        struct.data.StructureSetDate = seriesObject.parameters.get("StructureSetDate");

                        if (seriesObject.parameters.get("StructureSetDate") !== "" && struct.data.seriesDate === "") {
                            struct.data.seriesDate = seriesObject.parameters.get("StructureSetDate");
                        }


                        struct.data.StructureSetROISequence = seriesObject.parameters.get("StructureSetROISequence");

                        struct.data.ROINumber = seriesObject.parameters.get("ROINumber");
                        struct.data.ReferencedFrameOfReferenceUID = seriesObject.parameters.get("ReferencedFrameOfReferenceUID");
                        struct.data.ROIName = seriesObject.parameters.get("ROIName");
                        struct.data.ROIDescription = seriesObject.parameters.get("ROIDescription");
                        struct.data.ROIVolume = seriesObject.parameters.get("ROIVolume");
                        struct.data.ROIGenerationAlgorithm = seriesObject.parameters.get("ROIGenerationAlgorithm");
                        struct.ReferencedFrameOfReferenceSequence = seriesObject.parameters.get("ReferencedFrameOfReferenceSequence");
                        struct.data.ROIGenerationAlgorithm = seriesObject.parameters.get("ROIGenerationAlgorithm");

                        struct.data.rOIOberservationSequenceArray = seriesObject.parameters.get("RTROIObservationsSequence");

                        struct.data.detailsArray = [];
                        if (struct.data.StructureSetLabel) struct.data.detailsArray.push(this.getDetailsItem("StructureSetLabel", struct.data.StructureSetLabel));
                        if (struct.data.StructureSetName) struct.data.detailsArray.push(this.getDetailsItem("StructureSetName", struct.data.StructureSetName));
                        if (struct.data.StructureSetDescription) struct.data.detailsArray.push(this.getDetailsItem("StructureSetDescription", struct.data.StructureSetDescription));
                        if (struct.data.StructureSetDate) struct.data.detailsArray.push(this.getDetailsItem("StructureSetDate", struct.data.StructureSetDate));
                        if (struct.data.ROINumber) struct.data.detailsArray.push(this.getDetailsItem("ROINumber", struct.data.ROINumber));

                        this.rTStructs[seriesObject.parameters.get("SOPInstanceUID")] = struct;

                        break;
                    case "RTPLAN":
                        const plan = this.getBasicSeriesNode(seriesObject)
                        plan.data.SOPInstanceUID = seriesObject.parameters.get("SOPInstanceUID");
                        plan.data.FrameOfReferenceUID = seriesObject.parameters.get("FrameOfReferenceUID");
                        plan.data.StudyDescription = seriesObject.parameters.get("StudyDescription");
                        plan.data.RTPlanLabel = seriesObject.parameters.get("RTPlanLabel");
                        plan.data.RTPlanName = seriesObject.parameters.get("RTPlanName");
                        plan.data.RTPlanDescription = seriesObject.parameters.get("RTPlanDescription");

                        if (plan.data.seriesDescription === "") {

                            if (seriesObject.parameters.get("RTPlanDescription") !== undefined && seriesObject.parameters.get("RTPlanDescription") !== "") {
                                plan.data.seriesDescription = seriesObject.parameters.get("RTPlanDescription");
                            } else if (seriesObject.parameters.get("RTPlanLabel") !== undefined && seriesObject.parameters.get("RTPlanLabel") !== "") {
                                plan.data.seriesDescription = seriesObject.parameters.get("RTPlanLabel");
                            } else if (seriesObject.parameters.get("RTPlanName") !== undefined && seriesObject.parameters.get("RTPlanName") !== "") {
                                plan.data.seriesDescription = seriesObject.parameters.get("RTPlanName");
                            }
                        }

                        plan.data.PrescriptionDescription = seriesObject.parameters.get("PrescriptionDescription");
                        plan.data.RTPlanDate = seriesObject.parameters.get("RTPlanDate");

                        if (seriesObject.parameters.get("RTPlanDate") !== "" && plan.data.seriesDate === "") {
                            plan.data.seriesDate = seriesObject.parameters.get("RTPlanDate");
                        }

                        plan.data.RTPlanGeometry = seriesObject.parameters.get("RTPlanGeometry");
                        plan.ReferencedStructureSetSequence = seriesObject.parameters.get("ReferencedStructureSetSequence");

                        plan.data.detailsArray = [];
                        if (plan.data.RTPlanLabel) plan.data.detailsArray.push(this.getDetailsItem("RTPlanLabel", plan.data.RTPlanLabel));
                        if (plan.data.RTPlanName) plan.data.detailsArray.push(this.getDetailsItem("RTPlanName", plan.data.RTPlanName));
                        if (plan.data.PrescriptionDescription) plan.data.detailsArray.push(this.getDetailsItem("PrescriptionDescription", plan.data.PrescriptionDescription));
                        if (plan.data.RTPlanDate) plan.data.detailsArray.push(this.getDetailsItem("RTPlanDate", plan.data.RTPlanDate));
                        if (plan.data.ReferencedStructureSetSequence) plan.data.detailsArray.push(this.getDetailsItem("ReferencedStructureSetSequence", plan.data.ReferencedStructureSetSequence));
                        if (plan.data.RTPlanDescription) plan.data.detailsArray.push(this.getDetailsItem("RTPlanDescription", plan.data.RTPlanDescription));

                        this.rtPlans[seriesObject.parameters.get("SOPInstanceUID")] = plan;
                        break;
                    case "RTDOSE":
                        const dose = this.getBasicSeriesNode(seriesObject);
                        dose.data.SOPInstanceUID = seriesObject.parameters.get("SOPInstanceUID");
                        dose.data.StudyInstanceUID = seriesObject.parameters.get("StudyInstanceUID");
                        dose.data.FrameOfReferenceUID = seriesObject.parameters.get("FrameOfReferenceUID");
                        dose.data.StudyDescription = seriesObject.parameters.get("StudyDescription");
                        dose.data.DoseUnits = seriesObject.parameters.get("DoseUnits");
                        dose.data.DoseType = seriesObject.parameters.get("DoseType");
                        dose.data.DoseComment = seriesObject.parameters.get("DoseComment");

                        if (dose.data.seriesDescription === "") {
                            if (seriesObject.parameters.get("DoseComment") !== undefined && seriesObject.parameters.get("DoseComment") !== "") {
                                dose.data.seriesDescription = seriesObject.parameters.get("DoseComment");
                            }
                        }

                        dose.data.DoseSummationType = seriesObject.parameters.get("DoseSummationType");
                        dose.data.InstanceCreationDate = seriesObject.parameters.get("InstanceCreationDate");

                        if (seriesObject.parameters.get("InstanceCreationDate") !== "" && dose.data.seriesDate === "") {
                            dose.data.seriesDate = seriesObject.parameters.get("InstanceCreationDate");
                        }

                        dose.ReferencedRTPlanSequence = seriesObject.parameters.get("ReferencedRTPlanSequence");


                        dose.data.detailsArray = [];
                        if (dose.data.DoseUnits) dose.data.detailsArray.push(this.getDetailsItem("DoseUnits", dose.data.DoseUnits));
                        if (dose.data.DoseType) dose.data.detailsArray.push(this.getDetailsItem("DoseType", dose.data.DoseType));
                        if (dose.data.DoseComment) dose.data.detailsArray.push(this.getDetailsItem("DoseComment", dose.data.DoseComment));
                        if (dose.data.DoseSummationType) dose.data.detailsArray.push(this.getDetailsItem("DoseSummationType", dose.data.DoseSummationType));
                        if (dose.data.InstanceCreationDate) dose.data.detailsArray.push(this.getDetailsItem("InstanceCreationDate", dose.data.InstanceCreationDate));

                        this.rTDoses[seriesObject.parameters.get("SOPInstanceUID")] = dose;
                        break;
                    case "RTIMAGE":
                        const image = this.getBasicSeriesNode(seriesObject);
                        image.data.SOPInstanceUID = seriesObject.parameters.get("SOPInstanceUID");
                        image.data.StudyInstanceUID = seriesObject.parameters.get("StudyInstanceUID");
                        image.data.FrameOfReferenceUID = seriesObject.parameters.get("FrameOfReferenceUID");
                        image.data.StudyDescription = seriesObject.parameters.get("StudyDescription");
                        image.data.RTImageLabel = seriesObject.parameters.get("RTImageLabel");
                        image.data.RTImageName = seriesObject.parameters.get("RTImageName");
                        image.data.RTImageDescription = seriesObject.parameters.get("RTImageDescription");

                        if (image.data.seriesDescription === "") {
                            if (seriesObject.parameters.get("RTImageName") !== undefined && seriesObject.parameters.get("RTImageName") !== "") {
                                image.data.seriesDescription = seriesObject.parameters.get("RTImageName");
                            } else if (seriesObject.parameters.get("RTImageLabel") !== undefined && seriesObject.parameters.get("RTImageLabel") !== "") {
                                image.data.seriesDescription = seriesObject.parameters.get("RTImageLabel");
                            } else if (seriesObject.parameters.get("RTImageDescription") !== undefined && seriesObject.parameters.get("RTImageDescription") !== "") {
                                image.data.seriesDescription = seriesObject.parameters.get("RTImageDescription");
                            }
                        }

                        image.data.InstanceCreationDate = seriesObject.parameters.get("InstanceCreationDate");

                        if (seriesObject.parameters.get("InstanceCreationDate") !== "" && image.data.seriesDate === "") {
                            image.data.seriesDate = seriesObject.parameters.get("InstanceCreationDate");
                        }

                        image.ReferencedRTPlanSequence = seriesObject.parameters.get("ReferencedRTPlanSequence");

                        image.data.detailsArray = [];
                        if (image.data.RTImageLabel) image.data.detailsArray.push(this.getDetailsItem("RTImageLabel", image.data.RTImageLabel));
                        if (image.data.RTImageName) image.data.detailsArray.push(this.getDetailsItem("RTImageName", image.data.RTImageName));
                        if (image.data.RTImageDescription) image.data.detailsArray.push(this.getDetailsItem("RTImageDescription", image.data.RTImageDescription));
                        if (image.data.InstanceCreationDate) image.data.detailsArray.push(this.getDetailsItem("InstanceCreationDate", image.data.InstanceCreationDate));

                        this.rTImages[seriesObject.parameters.get("SOPInstanceUID")] = image;
                        break;
                    case "CT":
                        const ct = this.getBasicSeriesNode(seriesObject);
                        ct.data.SOPInstanceUID = seriesObject.parameters.get("SOPInstanceUID");
                        ct.data.StudyInstanceUID = seriesObject.parameters.get("StudyInstanceUID");
                        ct.data.FrameOfReferenceUID = seriesObject.parameters.get("FrameOfReferenceUID");
                        ct.data.MediaStorageSOPInstanceUID = seriesObject.parameters.get("MediaStorageSOPInstanceUID");
                        ct.data.BodyPartExamined = seriesObject.parameters.get("BodyPartExamined");
                        ct.data.StudyDescription = seriesObject.parameters.get("StudyDescription");
                        ct.data.ImageType = seriesObject.parameters.get("ImageType");

                        ct.data.detailsArray = [];
                        if (ct.data.ImageType) ct.data.detailsArray.push(this.getDetailsItem("ImageType", ct.data.ImageType));
                        if (ct.data.BodyPartExamined) ct.data.detailsArray.push(this.getDetailsItem("BodyPartExamined", ct.data.BodyPartExamined));

                        this.cTs[seriesObject.parameters.get("SeriesInstanceUID")] = ct;
                        break;
                    default:
                        const otherSeries = this.getBasicSeriesNode(seriesObject);
                        this.otherSeries[seriesObject.parameters.get("SOPInstanceUID")] = otherSeries;
                }

            }

        }
    }
}
