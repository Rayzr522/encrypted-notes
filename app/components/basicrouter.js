import React from 'react'
import StartScreen from './startscreen'
import EditorScreen from './editorscreen'
import SyncScreen from './syncscreen'
import { screens } from '../utils/constants'

const BasicRouter = React.createClass({
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

    render() {
        let screenElem = <StartScreen requestScreenChange={this.requestScreenChange}/>

        switch (this.state.screen) {
            case screens.START:
                screenElem = <StartScreen requestScreenChange={this.requestScreenChange}/>
                break
            case screens.EDITOR:
                screenElem = <EditorScreen requestScreenChange={this.requestScreenChange} noteId={this.state.noteId}/>
                break
            case screens.SYNC:
                screenElem = <SyncScreen requestScreenChange={this.requestScreenChange} noteId={this.state.noteId}/>
                break
            default:
                console.error(`Screen ${this.state.screen} is invalid!`)
                break
        }
        return screenElem
    }
})

export default BasicRouter