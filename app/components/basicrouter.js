import React from 'react'
import StartScreen from './startscreen'
import EditorScreen from './editorscreen'
import SyncScreen from './syncscreen'
import Dialog from './dialog'
import { screens, messageTypes, keyCodes } from '../utils/constants'
import { InvalidScreenError, FatalError, SevereError, UserError, ExtendableError } from '../utils/errors'


const BasicRouter = React.createClass({
    componentDidMount() {
        window.addEventListener('error', this.handleError)
        window.addEventListener('keydown', this.handleKeyDown)
    },

    requestScreenChange(newScreen, noteId) {
        if (newScreen == this.state.screen) {
            return
        }

        this.setState({screen: newScreen, noteId: noteId})
    },

    getInitialState() {
        return {
            screen: this.props.screen ? this.props.screen : screens.START,
            noteId: this.props.noteId ? this.props.noteId : 1,
            dialogMessage: null
        }

    },

    handleKeyDown(e) {
        if (e.keyCode == keyCodes.ESCAPE || e.keyCode == keyCodes.ENTER) {
            this.hideMsg()
        }
    },

    handleError(e) {
        window.e = e
        if (e.error instanceof ExtendableError) {
            console.log('Handling error:', e.error.stack)
            e.preventDefault()
        } else {
            throw e.error
        }
    },

    dspMsg(message, type = messageTypes.NOTICE, timer = null) {
        this.setState({
            dialogMessage: {
                message: message,
                type: type,
                timer: timer
            }
        })
    },

    hideMsg() {
        this.setState({dialogMessage: null})
    },

    render() {
        let screenElem = <StartScreen requestScreenChange={this.requestScreenChange} dspMsg={this.dspMsg} hideMsg={this.hideMsg} />

        switch (this.state.screen) {
            case screens.START:
                screenElem = <StartScreen requestScreenChange={this.requestScreenChange} dspMsg={this.dspMsg} hideMsg={this.hideMsg} />
                break
            case screens.EDITOR:
                screenElem = <EditorScreen requestScreenChange={this.requestScreenChange} dspMsg={this.dspMsg} hideMsg={this.hideMsg} noteId={this.state.noteId}/>
                break
            case screens.SYNC:
                screenElem = <SyncScreen requestScreenChange={this.requestScreenChange} dspMsg={this.dspMsg} hideMsg={this.hideMsg} noteId={this.state.noteId}/>
                break
            default:
                throw new InvalidScreenError(this.state.screen)
        }

        let dialogElem = null
        if (this.state.dialogMessage != null) {
            const { message, type, timer } = this.state.dialogMessage
            dialogElem = <Dialog close={this.hideMsg} message={message} type={type} timer={timer} />
        }

        return (
            <div>
                {dialogElem}
                {screenElem}
            </div>
        )
    }
})

export default BasicRouter
