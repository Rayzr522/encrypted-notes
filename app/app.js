import React from 'react'
import ReactDOM from 'react-dom'

import ReactTestUtils from 'react-addons-test-utils'

import {StartScreen} from './components/index.js'

ReactDOM.render(<StartScreen/>, document.getElementById('app'))

window.test = ReactTestUtils
window.ReactDOM = ReactDOM
