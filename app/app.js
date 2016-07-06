import React from 'react'
import ReactDOM from 'react-dom'
import {BasicRouter} from './components/index.js'
import DBManager from './backend/db'

DBManager.checkDatabaseInitialization()

ReactDOM.render(<BasicRouter/>, document.getElementById('app'))
