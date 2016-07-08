import React from 'react'
import { screens, unicodeSymbols, keyCodes, eventTypes } from '../utils/constants'
import { config } from '../config'
import { sleep } from '../utils/helpers'
import { cardSource, cardTarget, dragSourceCollect, dropTargetCollect, dropType } from '../utils/dragAndDropHelpers'
import { DragSource, DropTarget } from 'react-dnd'

const listItemStyle = {
    border: '1px dashed gray',
    padding: '0.5rem 1rem',
    marginBottom: '.5rem',
    backgroundColor: 'white',
    cursor: 'move',
    paddingLeft: 25,
    marginRight: 45
}

const buttonStyle = {
    float: 'right',
    fontSize: 20,
    top: -2,
    position: 'relative',
    cursor: 'pointer'
}

const NoteItem = React.createClass({
    getInitialState() {
        return {
            enteringPassword: false,
            currentPassword: '',
            ...this.props
        }
    },

    editHandler() {
        this.props.requestScreenChange(screens.EDITOR, this.state.note.id)
    },

    deleteHandler() {
        this.props.deleteNote(this.state.note.id, this.state.index)
    },

    lockHandler() {
        this.setState({enteringPassword: true})
        sleep(0).then(() => this.passwordInput.focus())
    },

    removePasswordInput() {
        this.setState({enteringPassword: false})
    },

    toggleNoteCallback(success, error) {
        if (!success) {
            if (error.message == 'Bad hmac value') {
                alert('Your entered password was incorrect!')
            } else {
                alert('There was an unknown error.')
            }
            return
        }
        this.removePasswordInput()
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

        if (!this.state.note.locked && !confirm(
                'Are you sure you want to lock this note? ' +
                'If you forget the password, the note will be impossible to recover!'
            )
        ) {
            return
        }

        sleep(0)
            .then(() =>
                this.props.toggleNoteLock(this.state.note.id, this.passwordInput.value, this.toggleNoteCallback)
            )
    },

    validatePassword(password) {
        return password.length >= config.minimumPasswordLength
    },

    componentWillReceiveProps(newProps) {
        this.setState({index: newProps.index, note: newProps.note})
    },

    render() {
        /*
         -----------------------------------------------------------------------------------------------
         |  [Locked/Unlocked] Title         {passwordInput} [Checkbox]  [Lock/Unlock] [Edit] [Delete]   |
         |   lockedStatus     title          passwordInput    check      lockToggle    edit  deleteSec  |
         -----------------------------------------------------------------------------------------------
         */
        const { note, isDragging, connectDragSource, connectDropTarget } = this.props

        // title
        const title = note.title ? note.title : note.id

        // lockedStatus
        let lockedStatus = (
            <span

                title={`${this.state.note.locked ? 'Locked' : 'Unlocked'}`}
                style={{
                    color: this.state.note.locked ? 'green' : 'red',
                    paddingRight: 10, top: -2, position: 'relative', cursor: 'default'
                }}
            >
                <kdb>{this.state.note.locked ? unicodeSymbols.locked : unicodeSymbols.unlocked}</kdb>
            </span>
        )

        let lockToggle
        const lockToggleRightOffset = this.state.note.locked ? 44 : 15

        if (this.state.enteringPassword) {
            // This section has the {passwordInput} [Checkbox]
            const borderColor = this.validatePassword(this.state.currentPassword) ? 'green' : 'red'

            lockToggle = (
                <div style={{...buttonStyle, right: lockToggleRightOffset, top:-6}}>
                    {/* passwordInput */}
                    <input
                        style={{border: `2px solid ${borderColor}`}}
                        type="password" ref={(ref)=>this.passwordInput=ref}
                        onKeyDown={this.confirmPassword} placeholder="Password"
                    />
                    {/* check */}
                    <kbd style={{position: 'relative', top: 2, left: 2}} onClick={this.confirmPassword} title="Accept">
                        {unicodeSymbols.check}
                    </kbd>
                </div>
            )
        } else {
            // This section has the [Lock/Unlock]
            lockToggle = (
                <div
                    onClick={this.lockHandler}
                    style={{...buttonStyle, right: lockToggleRightOffset, top: -4, color: this.state.note.locked ? 'red' : 'green'}}
                    title={`${this.state.note.locked ? 'Unlock' : 'Lock'}`}
                >
                    <kdb>{this.state.note.locked ? unicodeSymbols.unlocked : unicodeSymbols.locked}</kdb>
                </div>
            )
        }

        let deleteSect, edit

        if (!this.state.note.locked) {
            deleteSect = (
                <div title="Delete" onClick={this.deleteHandler} style={{...buttonStyle, left: 5}}>
                    <kbd>{unicodeSymbols.delete}</kbd>
                </div>
            )
            edit = (
                <div title="Edit" onClick={this.editHandler} style={{...buttonStyle, right: 5}}>
                    <kbd>{unicodeSymbols.edit}</kbd>
                </div>
            )
        }

        const opacity = isDragging ? 0 : 1
        return connectDragSource(connectDropTarget(
            <li style={{...listItemStyle, opacity}}>
                {lockedStatus}
                {title}
                {deleteSect}
                {edit}
                {lockToggle}
            </li>
        ))
    }
})

export default
    DropTarget(dropType, cardTarget, dropTargetCollect)(
        DragSource(dropType, cardSource, dragSourceCollect)(
            NoteItem
        )
    )