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

    getSelectedFilesCount() {
        if (this.selectedSeriesObjects === null) { return 0 };
        if (this.selectedSeriesObjects.length === 0) { return 0 };

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

    evaluate() {
        const results = [];
        let counter = 0;
        
        // results.push({
        //     key : counter,
        //     title: "test title",
        //     message: "test",
        //     series: "test series",
        //     file: "test filename"
        // });

        return results;
    }

    pseudonymize() {

        for (let uid in this.selectedSeriesObjects) {
            const selectedSeries = this.selectedSeriesObjects[uid];
            if (selectedSeries.parameters != null) {
                selectedSeries.pseudomyzedFiles = (Object.keys(selectedSeries.instances).map(function (key, index) { return selectedSeries.instances[key].fileObject }));
                console.log(selectedSeries.pseudomyzedFiles);
            }
        }
        console.log("Generating Pseudonyms");
    }



}