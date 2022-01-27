// React
import { Card } from 'primereact/card';
import React, { Component } from 'react';
import { connect } from "react-redux";


/**
 * SlotPanel component
 */
export class SlotPanel extends Component {

    /**
     * Get study name from redux state
     */
    getStudyName() {
        if (Object.values(this.props.slots).length === 1) {
            return Object.values(this.props.slots)[0].study
        }
    }

    /**
     * Get study event from redux state
     */
    getStudyEvent() {
        if (Object.values(this.props.slots).length === 1) {
            return Object.values(this.props.slots)[0].studyEvent
        }
    }

    /**
     * Get study event date from redux state
     */
    getStudyEventDate() {
        if (Object.values(this.props.slots).length === 1) {
            return Object.values(this.props.slots)[0].studyEventDate
        }
    }

    /**
     * Get slot name from redux state
     */
    getSlotName() {
        if (Object.values(this.props.slots).length === 1) {
            return Object.values(this.props.slots)[0].slotName
        }
    }

    /**
     * Get study subject ID from redux state
     */
    getStudySubjectID() {
        if (Object.values(this.props.slots).length === 1) {
            return Object.values(this.props.slots)[0].studySubjectID
        }
    }

    /**
     * Get subject pseudonym from redux state
     */
    getSubjectPseudonym() {
        if (Object.values(this.props.slots).length === 1) {
            return Object.values(this.props.slots)[0].subjectPseudonym
        }
    }

    /**
     * Get subject sex from redux state
     */
    getSubjectSex() {
        if (Object.values(this.props.slots).length === 1) {
            return Object.values(this.props.slots)[0].subjectSex
        }
    }

    /**
     * Get subject DOB from redux state
     */
    getSubjectDOB() {
        if (Object.values(this.props.slots).length === 1) {
            return Object.values(this.props.slots)[0].subjectDOB
        }
    }

    /**
     * Render the component
     */
    render = () => {
        return (
            <Card title="DICOM Upload Slot">
                <div className="flex flex-wrap card-container text-sm">
                    <div className="flex" style={{ "minWidth": "200px" }}>
                        <div className="font-bold" style={{ "width": "100px" }} >
                            Study:&nbsp;
                        </div>
                        <div  >
                            {this.getStudyName()} 
                            {/* &nbsp;
                           {true ? <i className="pi pi-check mr-2" style={{'color': 'green'}}></i> : null}
                           {true ? <i className="pi pi-times" style={{'color': 'red'}}></i> : null} */}

                        </div>

                    </div>
                    <div className="flex" style={{ "minWidth": "200px" }}>
                        <div className="font-bold" style={{ "width": "100px" }}>
                            Study Subject:&nbsp;
                        </div>
                        <div  >
                            {this.getStudySubjectID()}
                        </div>
                    </div>
                    <div className="flex" style={{ "minWidth": "200px" }}>
                        <div className="font-bold" style={{ "width": "100px" }} >
                            Study Event:&nbsp;
                        </div>
                        <div  >
                            {this.getStudyEvent()}
                        </div>
                    </div>
                    <div className="flex" style={{ "minWidth": "200px" }}>
                        <div className="font-bold" style={{ "width": "100px" }} >
                            PID:&nbsp;
                        </div>
                        <div  >
                            {this.getSubjectPseudonym()}
                        </div>
                    </div>
                    <div className="flex" style={{ "minWidth": "200px" }}>
                        <div className="font-bold" style={{ "width": "100px" }} >
                            Event Date:&nbsp;
                        </div>
                        <div  >
                            {this.getStudyEventDate()}
                        </div>
                    </div>
                    <div className="flex" style={{ "minWidth": "200px" }}>
                        <div className="font-bold" style={{ "width": "100px" }} >
                            Subject Sex:&nbsp;
                        </div>
                        <div  >
                            {this.getSubjectSex()}
                        </div>
                    </div>
                    <div className="flex" style={{ "minWidth": "200px" }}>
                        <div className="font-bold" style={{ "width": "100px" }} >
                            Slot:&nbsp;
                        </div>
                        <div  >
                            {this.getSlotName()}
                        </div>
                    </div>
                    <div className="flex" style={{ "minWidth": "200px" }}>
                        <div className="font-bold" style={{ "width": "100px" }} >
                            Subject DOB:&nbsp;
                        </div>
                        <div  >
                            {this.getSubjectDOB()}
                        </div>
                    </div>
                </div>
            </Card>
        )
    }
}

// Defines which state from the Redux store should be pulled to the SlotPanel component
// it populates this.props.slots from state.Slots.slots reducer
const mapStateToProps = state => {
    return {
        slots: state.Slots.slots,
    }
}

// Access to Redux store dispatch methods
const mapDispatchToProps = {

}

// Connects Uploader component to Redux store
export default connect(mapStateToProps, mapDispatchToProps)(SlotPanel)