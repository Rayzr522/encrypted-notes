import React from 'react'
import {screens} from '../utils/constants'
import DBManager from '../backend/db'
import TinyMCEEditor from './tinymceeditor'


const EditorScreen = React.createClass({
    getInitialState() {
        const note = this.props.noteId ? DBManager.getNote(this.props.noteId) : DBManager.insertNote({})
        return {
            noteId: note.id,
            note: note
        }
    },
    
    backToStart() {
        this.props.requestScreenChange(screens.START)
    },

    getCurrentNoteValues() {
        return {
            title: this.titleInput.value,
            text: this.editor.getContent()
        }
    },
    
    saveNote() {
        let currentNoteState = this.state.note

        Object.assign(currentNoteState, this.getCurrentNoteValues())

        DBManager.updateNote(currentNoteState)
        
        this.backToStart()
    },

    cancelEdits() {
        const note = this.state.note
        const origNoteStringified = JSON.stringify({title: note.title, text: note.text})
        const currentNoteStringified = JSON.stringify(this.getCurrentNoteValues())
        if (origNoteStringified == currentNoteStringified || confirm('Are you sure you want to cancel your changes?')) {
            this.backToStart()
        }
    },

    deleteNote() {
        if (confirm('Are you sure you want to delete this note?')) {
            DBManager.deleteNote(noteId)
            this.backToStart()
        }
    },
    
    render() {
        const titleRef = (ref) => this.titleInput = ref
        let titleInput
        if (this.state.note.title) {
            titleInput = <input ref={titleRef} defaultValue={this.state.note.title} />
        } else {
            titleInput = <input ref={titleRef} placeholder="Title" />
        }

        const editorRef = (ref) => this.editor = ref
        return (
            <div>
                <h2>{titleInput}</h2>
                <TinyMCEEditor ref={editorRef} content={this.state.note.text} dspMsg={this.props.dspMsg}/>
                <button onClick={this.saveNote}>Save</button>
                <button onClick={this.cancelEdits}>Cancel</button>
                <button onClick={this.deleteNote}>Delete</button>
            </div>
        )
    }
})

export default EditorScreen