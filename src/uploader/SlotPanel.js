// React
import React, { Component } from 'react'
import {connect} from "react-redux";

/**
 * SlotPanel component
 */
export class SlotPanel extends Component {

    // From redux state
    buildStudyName() {
        for (let slot of Object.values(this.props.slots)) {
           return slot.study
        }
    }

    /**
     * Render the component
     */
    render = () => {
        return (
            <div className="card">
                <h5>Upload Slot</h5>
                <div className="p-grid p-formgrid p-fluid">
                    <div className="p-col-12 p-lg-4">
                        Study: {this.buildStudyName()}
                    </div>
                </div>
            </div>
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