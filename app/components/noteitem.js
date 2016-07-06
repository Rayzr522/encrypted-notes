import React from 'react'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'
import { screens, unicodeSymbols, keyCodes, eventTypes } from '../utils/constants'
import {config} from '../config'
import {sleep} from '../utils/helpers'

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
        return {enteringPassword: false, currentPassword: '', ...this.props}
    },

    editHandler() {
        this.props.requestScreenChange(screens.EDITOR, this.state.note.id)
    },

    deleteHandler() {
        // TODO Dont allow deleting of notes that are locked
        this.props.deleteNote(this.state.note.id, this.state.index)
    },

    lockHandler() {
        this.setState({enteringPassword: true})
        sleep(0).then(() => this.passwordInput.focus())
    },

    removePasswordInput() {
        this.setState({enteringPassword: false})
    },

    confirmPassword(e) {
        if (e.type == eventTypes.KEYDOWN) {
            if (e.keyCode == keyCodes.ESCAPE) {
                this.removePasswordInput()
                return
            } else if (e.keyCode != keyCodes.ENTER) {
                sleep(0).then(() => {
                    this.setState({currentPassword: this.passwordInput.value})
                })
                return
            }
        }

        if (!this.validatePassword(this.passwordInput.value)) {
            alert('Your password is invalid!')
            return
        }

        if (!confirm('Are you sure you want to lock this note? If you forget the password, the note will be impossible to recover!')) {
            return
        }

        sleep(0)
            .then(() => this.props.toggleNoteLock(this.state.note.id, this.passwordInput.value, this.removePasswordInput))
    },

    validatePassword(password) {
        return password.length >= config.minimumPasswordLength
    },

    componentWillReceiveProps(newProps) {
        this.setState({index: newProps.index, note: newProps.note})
    },

    render() {
        const {note, isDragging, connectDragSource, connectDropTarget} = this.props

        const opacity = isDragging ? 0 : 1
        const title = note.title ? note.title : note.id

        let currentLockStatusSection = (
            <span
                title={`${this.state.note.locked ? 'Locked' : 'Unlocked'}`}
                style={{
                    color: this.state.note.locked ? 'green' : 'red',
                    paddingRight: 10, top: -2, position: 'relative'
                }}
            >
                <kdb>{this.state.note.locked ? unicodeSymbols.locked : unicodeSymbols.unlocked}</kdb>
            </span>
        )

        let toggleLockSection

        if (this.state.enteringPassword) {
            const borderColor = this.validatePassword(this.state.currentPassword) ? 'green' : 'red'
            toggleLockSection = (
                <div style={{...buttonStyle, right: 15, top:-6}}>
                    <input
                        style={{border: `2px solid ${borderColor}`}}
                        type="password" ref={(ref)=>this.passwordInput=ref}
                        onKeyDown={this.confirmPassword} placeholder="Password"
                    />
                    <kbd style={{position: 'relative', top: 2, left: 2}} onClick={this.confirmPassword} title="Accept">
                        {unicodeSymbols.check}
                    </kbd>
                </div>
            )
        } else {
            toggleLockSection = (
                <div
                    onClick={this.lockHandler}
                    style={{...buttonStyle, right: 15, top: -4, color: this.state.note.locked ? 'red' : 'green'}}
                    title={`${this.state.note.locked ? 'Unlock' : 'Lock'}`}
                >
                    <kdb>{this.state.note.locked ? unicodeSymbols.unlocked : unicodeSymbols.locked}</kdb>
                </div>
            )
        }

        return connectDragSource(connectDropTarget(
            <li style={{...listItemStyle, opacity}}>
                {currentLockStatusSection}
                {title}
                <div title="Delete" onClick={this.deleteHandler} style={{...buttonStyle, left: 5}}>
                    <kbd>{unicodeSymbols.delete}</kbd>
                </div>
                <div title="Edit" onClick={this.editHandler} style={{...buttonStyle, right: 5}}>
                    <kbd>{unicodeSymbols.edit}</kbd>
                </div>
                {toggleLockSection}
            </li>
        ))
    }
})

export default DropTarget(dropType, cardTarget, dropTargetCollect)(DragSource(dropType, cardSource, dragSourceCollect)(NoteItem))