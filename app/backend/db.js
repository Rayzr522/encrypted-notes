// Right now there is no DB, just a really basic LocalStorage wrapper.
// Using a dict to store the data and a separate array to store the proper order of the keys

import db from '../utils/localStorage'
import uuid from 'node-uuid'

export default class DBManager {
    static get collectionName() {return 'notes'}
    static get orderingName() {return 'notesOrdering'}

    static getUUID() {
        return uuid.v4()
    }

    static getNote(comparator = (() => true)) {
        if (typeof comparator == 'function') {
            return this.getNotesOrdered(comparator).reverse().pop()
        } else {
            return db.get(this.collectionName)[comparator]
        }
    }

    static setNote(note) {
        let notes = db.getAll().notes
        notes[note.id] = note
        db.set(this.collectionName, notes)
    }

    static getNotesOrdered(comparator = (() => true)) {
        const notesDict = db.get(this.collectionName)
        const notesOrdering = db.get(this.orderingName)

        let notes = []

        notesOrdering.forEach(id => {
            const note = notesDict[id]

            if (comparator(note)) {
                notes.push(note)
            }
        })

        return notes
    }

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
            throw new Error(`Id ${note.id} already exists in the database!`)
        }
        this.setNote(note)

        let notesOrdering = db.get(this.orderingName)
        notesOrdering.splice(position, 0, note.id)
        db.set(this.orderingName, notesOrdering)
        
        return note
    }

    static updateNote(newNote, newPosition) {
        // This shouldnt do anything if there are no changes to the note
        let note = this.getNote(newNote.id)
        Object.assign(note, newNote)
        this.setNote(note)

        // We dont want to modify the positioning if none was specified
        // If the new position is the same as the current one, this cant hurt
        if (newPosition == null) {
            return
        }
        let notesOrdering = db.get(this.orderingName)
        const noteIndex = notesOrdering.indexOf(note.id)
        notesOrdering.splice(noteIndex, 1)
        notesOrdering.splice(newPosition, 0, note.id)
        db.set(this.orderingName, notesOrdering)

        return note
    }

    static upsertNote(note, position) {
        if (this.getNote(note.id)) {
            return this.updateNote(note, position)
        } else {
            return this.insertNote(note, position)
        }
    }

    static setNotes(notes, ordering) {
        db.set(this.collectionName, notes)
        db.set(this.orderingName, ordering)
    }

    static checkDatabaseInitialization() {
        const notesOrdering = db.get(this.orderingName)
        if (notesOrdering == undefined) {
            this.setNotes({}, [])
            return
        }

        const notes = db.getAll().notes
        if (!notes) {
            this.setNotes({}, [])
            return
        }

        if (Object.keys(notes).length != notesOrdering.length) {
            console.error(
                `There is an inconsistency between notes and their ordering.
                There are ${Object.keys(notes).length} notes and ${notesOrdering.length} ordering items.`
            )
            return
        }
    }
}