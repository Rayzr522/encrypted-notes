import React from 'react'
import { screens, eventTypes, keyCodes, unicodeSymbols } from '../utils/constants'
import DBManager from '../backend/db'
import Sync from '../backend/onlinesync'
import { validateUUID, sleep } from '../utils/helpers'

const SyncScreen = React.createClass({
    getInitialState() {
        return {
            currentToken: DBManager.getCurrentToken(),
            enteringToken: false,
            ...this.props
        }
    },

    backToStart() {
        this.props.requestScreenChange(screens.START)
    },

    setTokenState() {
        this.setState({currentToken: DBManager.getCurrentToken()})
    },

    generateToken() {
        const token = DBManager.getUUID()
        DBManager.setCurrentToken(token)
        this.doSync()
    },

    showTokenInput() {
        this.setState({enteringToken: true})
        sleep(0).then(() => this.tokenInput.focus())
    },

    removeTokenInput() {
        this.setState({enteringToken: false})
    },

    useExistingToken() {
        const token = this.tokenInput.value
        if (!validateUUID(token)) {
            alert(`${token} is not a valid UUID!`)
            return
        }
        DBManager.setCurrentToken(token)
        this.removeTokenInput()
        this.doSync()
    },

    handleTokenEvent(e) {
        if (e.type == eventTypes.KEYDOWN) {
            if (e.keyCode == keyCodes.ESCAPE) {
                this.removeTokenInput()
            } else if (e.keyCode == keyCodes.ENTER) {
                this.useExistingToken()
            }
        } else {
            this.useExistingToken()
        }
    },

    doSync() {
        Sync.sync(DBManager.getCurrentToken())
        this.setTokenState()
    },

    render() {
        let tokenButtons = (
            <div>
                <button disabled={this.state.enteringToken} onClick={this.generateToken}>
                    Generate New Token to Use
                </button>
                &nbsp;&nbsp;&nbsp;
                <button disabled={this.state.enteringToken} onClick={this.showTokenInput}>
                    Use Existing Token
                </button>
            </div>
        )

        let currentToken

        if (this.state.enteringToken) {
            currentToken = (

                <div>
                    Enter an existing token that matches one in the system already:
                    <kbd
                        style={{position: 'relative', top: 2, left: 193, fontSize: 18, cursor: 'pointer'}}
                        onClick={this.useExistingToken} title="Accept"
                    >
                        {unicodeSymbols.check}
                    </kbd>
                    <input
                        placeholder="Enter Token" ref={(ref)=>this.tokenInput=ref}
                        onKeyDown={this.handleTokenEvent}
                    />
                </div>
            )
        } else if (this.state.currentToken) {
            currentToken = (
                <div>
                    <span>Your current token is: {this.state.currentToken}</span>
                </div>
            )
        } else {
            currentToken = (
                <div>
                    <span>You do not currently have a sync token.</span>
                </div>
            )
        }

        return (
            <div>
                <h2 style={{display: 'inline-block'}}>Online Sync Settings</h2>
                &nbsp;&nbsp;
                <button onClick={this.backToStart}>Back</button>
                <div>
                    {currentToken}
                    <br />
                    {tokenButtons}
                </div>
            </div>
        )
    }
})

export default SyncScreen