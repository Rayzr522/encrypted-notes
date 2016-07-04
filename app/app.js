import React from 'react'
import ReactDOM from 'react-dom'

import ReactTestUtils from 'react-addons-test-utils'

import {DatePicker, MainPage, TinyMCEEditor} from './components/index.js'


const editor = <TinyMCEEditor content="hey"/>

ReactDOM.render(editor, document.getElementById('content'))

window.test = ReactTestUtils
window.ReactDOM = ReactDOM
window.editor = editor