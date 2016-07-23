import React from 'react'
import NotesList from './noteslist'
import { screens } from '../utils/constants'

const StartScreen = React.createClass({
    newNote() {
        this.props.requestScreenChange(screens.EDITOR)
    },

    syncSettings() {
        this.props.requestScreenChange(screens.SYNC)
    },

    render() {
        return (
            <div>
                <h2>Note Taker</h2>
                <button onClick={this.newNote}>+ New Note</button>
                &nbsp;&nbsp;&nbsp;
                <button onClick={this.syncSettings}>Sync Settings</button>
                <NotesList requestScreenChange={this.props.requestScreenChange} dspMsg={this.props.dspMsg} />
            </div>
        )
    }
})

export default StartScreen