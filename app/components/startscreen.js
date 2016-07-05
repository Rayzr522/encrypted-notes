import React from 'react'
import NotesList from './noteslist'
import {screens} from '../utils/constants'

const StartScreen = React.createClass({
    newNote() {
        this.props.requestScreenChange(screens.EDITOR)
    },
    
    render() {
        return (
            <div>
                <h2>Note Taker</h2>
                <button onClick={this.newNote}>+ New Note</button>
                <NotesList/>
            </div>
        )
    }
})

export default StartScreen