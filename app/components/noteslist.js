import React from 'react'
import update from 'react/lib/update'
import NoteItem from './noteitem'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import {t} from '../utils/helpers'
import DBManager from '../backend/db'

const NotesList = React.createClass({
    getInitialState() {
        return {
            items: t(this.props.items, this.getItemsFromDB()),
            width: t(this.props.width, 400)
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

    render() {
        const list = this.state.items.map((note, i) => {
            const title = note.title ? note.title : note.id
            return (
                <NoteItem key={note.id} index={i} id={note.id} text={title} moveNote={this.moveNote}/>
            )
        })
        const style = {width: this.state.width}
        return (
            <ul style={style}>
                {list}
            </ul>
        )
    }
})

export default DragDropContext(HTML5Backend)(NotesList)