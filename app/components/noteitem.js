import React from 'react'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'
import { screens, unicodeSymbols } from '../utils/constants'

const dropType = 'note'

const listItemStyle = {
    border: '1px dashed gray',
    padding: '0.5rem 1rem',
    marginBottom: '.5rem',
    backgroundColor: 'white',
    cursor: 'move'
}

const buttonStyle = {
    float: 'right',
    fontSize: 20,
    top: -2,
    position: 'relative',
    cursor: 'pointer'
}

const cardSource = {
    beginDrag(props) {
        return {
            id: props.note.id,
            index: props.index
        }
    }
}

const cardTarget = {
    hover(props, monitor, component) {
        const dragIndex = monitor.getItem().index
        const hoverIndex = props.index

        if (dragIndex == hoverIndex) {
            return
        }

        const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

        const clientOffset = monitor.getClientOffset()

        const hoverClientY = clientOffset.y - hoverBoundingRect.top

        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
            return
        }
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
            return
        }

        props.moveNote(dragIndex, hoverIndex)
        monitor.getItem().index = hoverIndex
    }
}

const dropTargetCollect = (connect) => ({
    connectDropTarget: connect.dropTarget()
})
const dragSourceCollect = (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
})

const NoteItem = React.createClass({
    getInitialState() {
        return this.props
    },
    
    editHandler() {
        this.props.requestScreenChange(screens.EDITOR, this.state.note.id)
    },
    
    deleteHandler() {
        this.props.deleteNote(this.state.note.id, this.state.index)
    },

    componentWillReceiveProps(newProps) {
        this.setState({index: newProps.index})
    },

    render() {
        const {note, isDragging, connectDragSource, connectDropTarget} = this.state

        const opacity = isDragging ? 0 : 1
        const title = note.title ? note.title : note.id

        return connectDragSource(connectDropTarget(
            <li style={{...listItemStyle, opacity}}>
                {title}
                <div onClick={this.deleteHandler} style={{...buttonStyle, left: 5}}>
                    <kbd>{unicodeSymbols.delete}</kbd>
                </div>
                <div onClick={this.editHandler} style={{...buttonStyle, right: 5}}>
                    <kbd>{unicodeSymbols.edit}</kbd>
                </div>
            </li>
        ))
    }
})

export default DropTarget(dropType, cardTarget, dropTargetCollect)(DragSource(dropType, cardSource, dragSourceCollect)(NoteItem))