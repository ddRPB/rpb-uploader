import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { Component } from 'react';

export class DicomSeriesSelection extends Component {
    constructor(props) {
        super(props);
    }

    dummyItems = [
        {
            seriesInstanceUID: "dummykey",
            modality: "modality",
            seriesDescription: "des",
            seriesDate: "date"
        }
    ];

    // selectedStudy={this.state.selectedStudy}
    buildSeriesRows() {
        let seriesArray = []

        if (this.props.selectedStudy === null) {
            return seriesArray;

        }

        if (this.props.selectedStudy.series !== null) {
            for (let seriesInstanceUID in this.props.selectedStudy.series) {
                let series = this.props.selectedStudy.series[seriesInstanceUID];
                seriesArray.push(series);
                series.key = seriesInstanceUID;
            }
        }
        console.log(seriesArray);
        return seriesArray
    }


    render() {
        return (
            <DataTable
                value={this.buildSeriesRows()}
                selection={this.props.selectedSeries}
                onSelectionChange={(e) => this.props.selectSeries(e)}
                dataKey="seriesInstanceUID"
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
                <Column field="modality" header="Modality" />
                <Column field="seriesDescription" header="Description" />
                <Column field="seriesDate" header="Date" />
            </DataTable>
        )
    }
}