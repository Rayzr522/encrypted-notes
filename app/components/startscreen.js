import React from 'react'
import {NotesList} from './index.js'

class StartScreen extends React.Component {
    render() {
        return (
        <div>
            <h2>Note Taker</h2>
            <NotesList items={[{id: 'hey', title: 'hey title'}, {id:1231}]}/>
        </div>
        )
    }
}

export default StartScreen