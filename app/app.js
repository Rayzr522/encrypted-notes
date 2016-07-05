import React from 'react'
import ReactDOM from 'react-dom'
import ReactTestUtils from 'react-addons-test-utils'
import {BasicRouter} from './components/index.js'
import db from './utils/localStorage'
import DBManager from './backend/db'

DBManager.checkDatabaseInitialization()

ReactDOM.render(<BasicRouter/>, document.getElementById('app'))

window.test = ReactTestUtils
window.ReactDOM = ReactDOM
window.React = React
window.DBManager = DBManager
window.db = db