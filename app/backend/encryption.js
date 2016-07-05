import Iron from 'iron'
import {config} from '../config'

export default class Encryption {
    static get ironMethods() {
        return {
            SEAL: Iron.seal,
            UNSEAL: Iron.unseal
        }
    }
    static get ironSettings() {
        return {
            encryption: {
                saltBits: 256,
                algorithm: 'aes-256-cbc',
                iterations: 1,
                minPasswordlength: config.minimumPasswordLength
            },
            integrity: {
                saltBits: 256,
                algorithm: 'sha256',
                iterations: 1,
                minPasswordlength: config.minimumPasswordLength
            },
            ttl: 0,
            timestampSkewSec: 60,
            localtimeOffsetMsec: 0
        }
    }
    static __promiseWrapper(obj, password, ironFunc) {
        return new Promise((resolve, reject) => {
            ironFunc(obj, password, this.ironSettings, function(err, successValue) {
                if (err) {
                    reject(err)
                } else {
                    resolve(successValue)
                }
            })
        })
    }

    static seal(obj, password) {
        return this.__promiseWrapper(obj, password, this.ironMethods.SEAL)
    }

    static unseal(obj, password) {
        return this.__promiseWrapper(obj, password, this.ironMethods.UNSEAL)
    }
}