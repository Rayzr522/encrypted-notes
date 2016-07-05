import React from 'react'
import {screens} from '../utils/constants'
import db from '../backend/db'
import TinyMCEEditor from './tinymceeditor'


const EditorScreen = React.createClass({
    getInitialState() {
        const note = this.props.noteId ? db.getNote(this.props.noteId) : db.insertNote({})
        return {
            noteId: note.id,
            note: note
        }
    },
    
    backToStart() {
        this.props.requestScreenChange(screens.START)
    },
    
    saveNote() {
        db.updateNote(this.state.note)
        
        this.backToStart()
    },
    
    render() {
        const refFunc = (ref) => this.titleInput = ref
        let titleInput
        if (this.state.note.title) {
            titleInput = <input ref={refFunc} value={this.state.note.title} />
        } else {
            titleInput = <input ref={refFunc} placeholder="Title" />
        }
        return (
            <div>
                <h2>{titleInput}</h2>
                <TinyMCEEditor text={this.state.note.text}/>
                <button onClick={this.saveNote}>Save</button>
            </div>
        )
    }
})

export default EditorScreen