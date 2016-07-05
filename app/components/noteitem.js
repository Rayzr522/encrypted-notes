import React from 'react'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'

const dropType = 'note'

const style = {
    border: '1px dashed gray',
    padding: '0.5rem 1rem',
    marginBottom: '.5rem',
    backgroundColor: 'white',
    cursor: 'move'
};

const cardSource = {
    beginDrag(props) {
        return {
            id: props.id,
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

    render() {
        const {text, isDragging, connectDragSource, connectDropTarget} = this.props
        const opacity = isDragging ? 0 : 1
        return connectDragSource(connectDropTarget(
            <li style={{...style, opacity}}>
                {text}
            </li>
        ))
    }
})

export default DropTarget(dropType, cardTarget, dropTargetCollect)(DragSource(dropType, cardSource, dragSourceCollect)(NoteItem))