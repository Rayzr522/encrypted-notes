import React from 'react'
import StartScreen from './startscreen'
import EditorScreen from './editorscreen'
import SyncScreen from './syncscreen'
import { screens } from '../utils/constants'
import { InvalidScreenError, FatalError, SevereError, UserError } from '../utils/errors'


const BasicRouter = React.createClass({
    componentDidMount() {
        window.addEventListener('error', this.handleError)
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
            noteId: this.props.noteId ? this.props.noteId : 1
        }

    },

    handleError(e) {
        window.e = e
        console.log('Handling error')
        e.preventDefault()
    },

    dspMsg(msgObj) {
        const { msg, type } = msgObj
    },

    render() {
        let screenElem = <StartScreen requestScreenChange={this.requestScreenChange} dspMsg={this.dspMsg} />

        switch (this.state.screen) {
            case screens.START:
                screenElem = <StartScreen requestScreenChange={this.requestScreenChange} dspMsg={this.dspMsg} />
                break
            case screens.EDITOR:
                screenElem = <EditorScreen requestScreenChange={this.requestScreenChange} dspMsg={this.dspMsg} noteId={this.state.noteId}/>
                break
            case screens.SYNC:
                screenElem = <SyncScreen requestScreenChange={this.requestScreenChange} dspMsg={this.dspMsg} noteId={this.state.noteId}/>
                break
            default:
                throw new InvalidScreenError(this.state.screen)
        }
        return screenElem
    }
})

export default BasicRouter