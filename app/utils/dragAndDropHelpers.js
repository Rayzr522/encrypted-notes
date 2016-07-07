import { findDOMNode } from 'react-dom'

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
        const draggedFromIndex = monitor.getItem().index
        const hoverToIndex = props.index

        if (draggedFromIndex == hoverToIndex) {
            return
        }

        const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

        const clientOffset = monitor.getClientOffset()

        const hoverClientY = clientOffset.y - hoverBoundingRect.top

        if (draggedFromIndex < hoverToIndex && hoverClientY < hoverMiddleY) {
            return
        }
        if (draggedFromIndex > hoverToIndex && hoverClientY > hoverMiddleY) {
            return
        }

        props.moveNote(draggedFromIndex, hoverToIndex)
        monitor.getItem().index = hoverToIndex
    }
}

const dropTargetCollect = (connect) => ({
    connectDropTarget: connect.dropTarget()
})
const dragSourceCollect = (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
})

const dropType = 'note'

export { cardSource, cardTarget, dropTargetCollect, dragSourceCollect, dropType }