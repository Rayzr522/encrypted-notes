import React from 'react'
import { screens, eventTypes, keyCodes, unicodeSymbols } from '../utils/constants'
import DBManager from '../backend/db'
import Sync from '../backend/onlinesync'
import { validateUUID, sleep } from '../utils/helpers'
import { ValidationError } from '../utils/errors'

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
        if (!confirm(
            'Are you sure you want to generate a new token? Any notes not synced from the remote server will ' +
            'remain connected to your old token, and not retrievable unless your old token is used to download them.'
        )) {
            return
        }

        const token = DBManager.getUUID()
        DBManager.setCurrentToken(token)
        this.setTokenState()
        this.pushToRemote()
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
            throw new ValidationError(null, `${token} is not a valid UUID`)
        }
        DBManager.setCurrentToken(token)
        this.setTokenState()
        this.removeTokenInput()
        this.mergeFromRemote()
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

    mergeFromRemote() {
        Sync.sync(false)
    },

    pushToRemote() {
        Sync.updateRemoteDataWithLocal(DBManager.getCurrentToken(), () => {})
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
                <br /><br />
                <button disabled={this.state.enteringToken || this.state.currentToken == null} onClick={this.mergeFromRemote}>
                    Pull & Merge From Remote
                </button>
                &nbsp;&nbsp;&nbsp;
                <button disabled={this.state.enteringToken || this.state.currentToken == null} onClick={this.pushToRemote}>
                    Push to Remote (no merge)
                </button>
            </div>
        )

        let currentToken

        if (this.state.enteringToken) {
            currentToken = (

                <div>
                    Enter an existing token that matches one in the system already:
                    <kbd
                        style={{position: 'relative', top: 2, left: 265, fontSize: 18, cursor: 'pointer'}}
                        onClick={this.useExistingToken} title="Accept"
                    >
                        {unicodeSymbols.check}
                    </kbd>
                    <input
                        placeholder="Enter Token" ref={(ref)=>this.tokenInput=ref}
                        onKeyDown={this.handleTokenEvent} style={{width: 240}}
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
                <p style={{fontWeight: 'bold'}}>
                    Please Note! : All of your remotely saved notes are connected to a specific sync token.
                    If you ever lose that token, you will also lose access to your remote notes. If you change tokens, your remote
                    notes will remain with your old token, and will not be accessible unless you re-enter your old token
                    using the "Use Existing Token" option.
                    <br />
                    Generating a new token will move all of your local notes over to a new sync token, and then upload them
                    with the new token.
                </p>
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