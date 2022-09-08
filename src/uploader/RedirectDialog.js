import { Dialog } from 'primereact/dialog'
import React, { Component } from 'react'

export default class RedirectDialog extends Component {
    render = () => {
        return (

            <Dialog
                header={"Redirect"}
                visible={this.props.redirectDialogPanel}
                closable={false}
                maximized={true}
            >
                You will be redirected to the RPB portal.
            </Dialog>

        )
    }
}