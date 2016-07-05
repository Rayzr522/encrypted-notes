import React from 'react'

let NotesList = React.createClass({
    getInitialState() {
        return {items: this.props.items}
    },

    componentWillReceiveProps(newProps) {
        this.setState({items: newProps.items})
    },

    render() {
        let list = this.state.items.map((note) => {
            let title = note.title ? note.title : note.id
            return (
                <li>
                    {title}
                </li>
            )
        })
        return (
            <ul>
                {list}
            </ul>
        )
    }
})

export default NotesList