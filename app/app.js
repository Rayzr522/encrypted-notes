import React from 'react'
import ReactDOM from 'react-dom'
import BasicRouter from './components/basicrouter'
import DBManager from './backend/db'

DBManager.checkDatabaseInitialization()

ReactDOM.render(<BasicRouter/>, document.getElementById('app'))
