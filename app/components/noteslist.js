import React from 'react'
import update from 'react/lib/update'
import {NoteItem} from './index.js'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

const NotesList = React.createClass({
    getInitialState() {
        return {items: this.props.items}
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
    },

    render() {
        let list = this.state.items.map((note, i) => {
            let title = note.title ? note.title : note.id
            return (
                <NoteItem key={note.id} index={i} id={note.id} text={title} moveNote={this.moveNote}/>
            )
        })
        return (
            <ul>
                {list}
            </ul>
        )
    }
})

export default DragDropContext(HTML5Backend)(NotesList)