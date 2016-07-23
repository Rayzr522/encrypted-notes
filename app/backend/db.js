// Right now there is no DB, just a really basic LocalStorage wrapper.
// Using a dict to store the data and a separate array to store the proper order of the keys

import db from '../utils/localStorage'
import { t } from '../utils/helpers'
import uuid from 'node-uuid'
import Encryption from './encryption'
import { NoteAlreadyExistsError, CannotDeleteNoteError, DatabaseIntegrityError } from '../utils/errors'
window.db = db

class DBManager {
    static get collectionName() { return 'notes' }
    static get orderingName() { return 'notesOrdering' }
    static get orderingTimestamp() { return 'notesOrderingTimestamp' }
    static get tokenName() { return 'notesToken' }

    static getUUID() {
        return uuid.v4()
    }

    static getCurrentToken() {
        return t(db.get(this.tokenName), null)
    }

    static setCurrentToken(token) {
        db.set(this.tokenName, token)
    }

    static getNotesOrdering() {
        return db.get(this.orderingName)
    }

    static getNotesOrderingTimestamp() {
        return db.get(this.orderingTimestamp)
    }

    static setNotesOrdering(ordering) {
        db.set(this.orderingName, ordering)
        this.setNotesOrderingTimestamp()
    }

    static setNotesOrderingTimestamp(timestamp = Date.now()) {
        db.set(this.orderingTimestamp, timestamp)
    }

    static getNote(comparator = (() => true)) {
        if (typeof comparator == 'function') {
            return this.getNotesOrdered(comparator).reverse().pop()
        } else {
            return db.get(this.collectionName)[comparator]
        }
    }

    static setNote(noteId, note) {
        let notes = db.getAll().notes
        note.timestamp = Date.now()
        if (note === null) {
            delete notes[noteId]
        } else {
            notes[noteId] = note
        }
        db.set(this.collectionName, notes)
    }

    static getAllNotes() {
        return db.get(this.collectionName)
    }

    static getNotesOrdered(comparator = ((note) => !note.deleted)) {
        const notesDict = this.getAllNotes()
        const notesOrdering = this.getNotesOrdering()

        let notes = []

        notesOrdering.forEach(id => {
            const note = notesDict[id]

            if (comparator(note)) {
                notes.push(note)
            }
        })

        return notes
    }

    // Primarily as a debugging tool
    static getNthNote(n) {
        const orderedNotes = this.getNotesOrdered()
        if (orderedNotes.length <= n) {
            return null
        }
        return orderedNotes[n]
    }

    static insertNote(note, position = Infinity) {
        if (!note.id) {
            note.id = this.getUUID()
        }
        if (db.has(note.id)) {
            throw new NoteAlreadyExistsError(note.id)
        }
        if (note.locked == null) {
            note.locked = false
        }
        this.setNote(note.id, note)

        let notesOrdering = this.getNotesOrdering()
        notesOrdering.splice(position, 0, note.id)
        this.setNotesOrdering(notesOrdering)

        return note
    }

    static updateNote(newNote, newPosition) {
        // This shouldnt do anything if there are no changes to the note
        let note = this.getNote(newNote.id)
        Object.assign(note, newNote)
        this.setNote(note.id, note)

        // We dont want to modify the positioning if none was specified
        // If the new position is the same as the current one, this cant hurt
        if (newPosition == null) {
            return
        }
        let notesOrdering = this.getNotesOrdering()
        const noteIndex = notesOrdering.indexOf(note.id)
        notesOrdering.splice(noteIndex, 1)
        notesOrdering.splice(newPosition, 0, note.id)
        this.setNotesOrdering(notesOrdering)

        return note
    }

    static upsertNote(note, position) {
        if (this.getNote(note.id)) {
            return this.updateNote(note, position)
        } else {
            return this.insertNote(note, position)
        }
    }

    static deleteNote(noteId) {
        const note = this.getNote(noteId)
        if (note.locked) {
            throw new CannotDeleteNoteError(null, 'You cannot delete a locked note!')
        }

        note.deleted = true
        Encryption.seal(note.text, this.getUUID()).then((result) => {
            note.text = result
            this.setNote(noteId, note)
        })
        this.setNote(noteId, note)

        let notesOrdering = this.getNotesOrdering()
        const noteIndex = notesOrdering.indexOf(noteId)
        notesOrdering.splice(noteIndex, 1)
        this.setNotesOrdering(notesOrdering)
    }

    static setNotes(notes, ordering) {
        if (notes) {
            db.set(this.collectionName, notes)
        }
        if (ordering) {
            this.setNotesOrdering(ordering)
        }
    }

    static checkDatabaseInitialization() {
        const notesOrdering = this.getNotesOrdering()
        if (notesOrdering == undefined) {
            this.setNotes({}, [])
            return
        }

        const notes = this.getAllNotes()
        if (!notes) {
            this.setNotes({}, [])
            return
        }

        const notesLength = objToArr(notes).map(
            (note) => !note.deleted
        ).filter(
            (deleted) => deleted
        ).length

        if (notesLength != notesOrdering.length) {
            throw new DatabaseIntegrityError()
        }
    }
}

window.DBManager = DBManager
export default DBManager