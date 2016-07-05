import React from 'react'
import StartScreen from './startscreen'
import EditorScreen from './editorscreen'
import {screens} from '../utils/constants'

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
        
        if (this.state.screen == screens.START) {
            screenElem = <StartScreen requestScreenChange={this.requestScreenChange}/>
        } else if (this.state.screen == screens.EDITOR) {
            screenElem = <EditorScreen requestScreenChange={this.requestScreenChange} noteId={this.state.noteId}/>
        }
        
        return screenElem
    }
})

export default BasicRouter