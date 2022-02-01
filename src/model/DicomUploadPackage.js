export default class DicomUploadPackage {

    constructor(uploadSlot) {
        if (uploadSlot != null) {
            this.uploadSlot = uploadSlot;
        } else {
            this.uploadSlot = {};
        }

        this.selectedSeriesObjects = {};

    }

    setSelectedSeries(selectedSeriesObjects) {
        this.selectedSeriesObjects = selectedSeriesObjects;
    }

    getSelectedFilesCount(){
        if(this.selectedSeriesObjects === null) {return 0};
        if(this.selectedSeriesObjects.length === 0){return 0};

        let selectedFiles = [];

        for (let uid in this.selectedSeriesObjects) {
            const selectedSeries = this.selectedSeriesObjects[uid];
            if (selectedSeries.parameters != null) {
                let result = (Object.keys(selectedSeries.instances).map(function (key, index) { return selectedSeries.instances[key].fileObject }));
                selectedFiles = selectedFiles.concat(result);
            }
        }

        return selectedFiles.length;
    }




}