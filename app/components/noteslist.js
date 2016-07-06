import React from 'react'
import update from 'react/lib/update'
import NoteItem from './noteitem'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import {t} from '../utils/helpers'
import DBManager from '../backend/db'
import Encryption from '../backend/encryption'
import {sleep} from '../utils/helpers'

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

    moveNote(dragIndex, hoverIndex) {
        const {items} = this.state
        const dragCard = items[dragIndex]

        this.setState(update(this.state, {
            items: {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, dragCard]
                ]
            }
        }))

        const noteMoved = DBManager.getNthNote(dragIndex)
        DBManager.updateNote(noteMoved, hoverIndex)
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
        }

        if (note.locked) {
            Encryption.unseal(note.text, password).then((result) => {
                note.text = result
                note.locked = false
                doUpdate(note)
            })
        } else {
            Encryption.seal(note.text, password).then((result) => {
                note.text = result
                note.locked = true
                doUpdate(note)
            })
        }
        callback()
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