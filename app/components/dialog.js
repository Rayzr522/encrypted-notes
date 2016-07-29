import React from 'react'
import { t, sleep } from '../utils/helpers'
import { messageTypes, keyCodes } from '../utils/constants'
import { config } from '../config'

const Dialog = React.createClass({
    componentDidMount() {
        this.setAutohideTimer()
    },

    getInitialState() {
        return {
            message: t(this.props.message, null),
            type: t(this.props.type, messageTypes.NOTICE),
            width: 400,
            height: 200,
            timer: t(this.props.timer, null)
        }
    },

    componentWillReceiveProps(nextProps) {
        this.setState({
            message: t(nextProps.message, this.state.message),
            type: t(nextProps.type, this.state.type),
            timer: t(nextProps.timer, this.state.timer)
        })
        sleep(0).then(this.setAutohideTimer)
    },

    clearInterval() {
        clearInterval(this.dismissInterval)
        this.dismissInterval = null
    },

    setAutohideTimer() {
        if (this.state.timer != null) {
            if (this.state.timer == 0) {
                this.close()
            } else if (!this.dismissInterval) {
                this.dismissInterval = setInterval(() => {
                    this.setState({timer: this.state.timer - 1})
                    sleep(0).then(this.setAutohideTimer)
                }, 1000)
            }
        } else {
            this.clearInterval()
        }
    },

    getBgColor(type) {
        switch(type) {
            case messageTypes.SUCCESS:
                return 'lightgreen'
            case messageTypes.ERROR:
                return 'red'
            case messageTypes.NOTICE:
            default:
                return 'white'
        }
    },

    getXPos() {
        return (config.dimensions.width / 2) - (this.state.width / 2)
    },

    getYPos() {
        return (config.dimensions.height / 2) - (this.state.height / 2)
    },

    close() {
        this.clearInterval()
        this.props.close()
    },

    render() {
        let timerSection = null
        if (this.state.timer != null) {
            timerSection = ` (${this.state.timer})`
        }
        return (
            <div>
                <div style={{
                    backgroundColor: '#CCC', zIndex: 1, opacity: 0.6,
                    position: 'absolute', top: 0, left: 0,
                    width: '100%', height: '100%'
                }} onClick={this.close}></div>
                <div style={{
                    backgroundColor: this.getBgColor(this.state.type), borderRadius: 5,
                    textAlign: 'center', fontWeight: 'bold',
                    position: 'absolute', top: this.getYPos(), left: this.getXPos(),
                    zIndex: 2, width: this.state.width, height: this.state.height
                }}>
                    <div style={{marginTop: 50}}>{this.state.message}</div>
                    <button style={{marginTop: 10}} onClick={this.close}>Dismiss{timerSection}</button>
                </div>
            </div>
        )
    }
})

export default Dialog