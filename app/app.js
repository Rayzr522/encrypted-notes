import React from 'react'
import ReactDOM from 'react-dom'
import BasicRouter from './components/basicrouter'
import DBManager from './backend/db'
import SyncTest from './tests/onlinesync'

DBManager.checkDatabaseInitialization()

ReactDOM.render(<BasicRouter/>, document.getElementById('app'))
