import React from 'react'
import update from 'react/lib/update'
import NoteItem from './noteitem'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import { t } from '../utils/helpers'
import DBManager from '../backend/db'
import Encryption from '../backend/encryption'
import { sleep } from '../utils/helpers'

const NotesList = React.createClass({
    getInitialState() {
        return {
            items: t(this.props.items, this.getItemsFromDB())
        }
    },

    getItemsFromDB() {
        return DBManager.getNotesOrdered()
    },

    componentWillReceiveProps(newProps) {
        this.setState({items: newProps.items})
    },

    moveNote(draggedFromIndex, hoverToIndex) {
        const {items} = this.state
        const draggedCard = items[draggedFromIndex]

        this.setState(update(this.state, {
            items: {
                $splice: [
                    [draggedFromIndex, 1],
                    [hoverToIndex, 0, draggedCard]
                ]
            }
        }))

        const noteMoved = DBManager.getNthNote(draggedFromIndex)
        DBManager.updateNote(noteMoved, hoverToIndex)
    },

    deleteNote(noteId, index) {
        if (confirm('Are you sure you want to delete this note?')) {
            DBManager.deleteNote(noteId)
            this.setState(update(this.state, {
                items: {
                    $splice: [
                        [index, 1],
                    ]
                }
            }))
        }
    },

    toggleNoteLock(noteId, password, callback) {
        let note = DBManager.getNote(noteId)

        const doUpdate = (note) => {
            DBManager.updateNote(note)
            sleep(0).then(() => this.setState({items: this.getItemsFromDB()}))
            callback(true)
        }

        if (note.locked) {
            Encryption.unseal(note.text, password)
                .then((result) => {
                    note.text = result
                    note.locked = false
                    doUpdate(note)
                })
                .catch((error) => {
                    callback(false, error)
                })
        } else {
            Encryption.seal(note.text, password)
                .then((result) => {
                    note.text = result
                    note.locked = true
                    doUpdate(note)
                })
                .catch((error) => {
                    callback(false, error)
                })
        }
    },

    render() {
        const list = this.state.items.map((note, i) => {
            return (
                <NoteItem
                    key={note.id} index={i} note={note} deleteNote={this.deleteNote}
                    moveNote={this.moveNote} requestScreenChange={this.props.requestScreenChange}
                    toggleNoteLock={this.toggleNoteLock}
                />
            )
        })
        return (
            <ul>{list}</ul>
        )
    }
})

export default DragDropContext(HTML5Backend)(NotesList)