// React
import React, { Component } from 'react'
import {connect} from "react-redux";

// Primereact
import { Panel } from 'primereact/panel';

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
            <Panel header="DICOM Upload Slot">
                <div className="p-grid p-formgrid p-fluid">
                    <div className="p-col-2">
                        Study:
                    </div>
                    <div className="p-col-4">
                        { this.getStudyName() }
                    </div>
                    <div className="p-col-2">
                        Study Subject:
                    </div>
                    <div className="p-col-4">
                        { this.getStudySubjectID() }
                    </div>
                    <div className="p-col-2">
                        Study Event:
                    </div>
                    <div className="p-col-4">
                        { this.getStudyEvent() }
                    </div>
                    <div className="p-col-2">
                        PID:
                    </div>
                    <div className="p-col-4">
                        { this.getSubjectPseudonym() }
                    </div>
                    <div className="p-col-2">
                        Event Date:
                    </div>
                    <div className="p-col-4">
                        { this.getStudyEventDate() }
                    </div>
                    <div className="p-col-2">
                        Subject Sex:
                    </div>
                    <div className="p-col-4">
                        { this.getSubjectSex() }
                    </div>
                    <div className="p-col-2">
                        Slot:
                    </div>
                    <div className="p-col-4">
                        { this.getSlotName() }
                    </div>
                    <div className="p-col-2">
                        Subject DOB:
                    </div>
                    <div className="p-col-4">
                        { this.getSubjectDOB() }
                    </div>
                </div>
            </Panel>
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