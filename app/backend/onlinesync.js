import DBManager from './db'
import deepDiff from 'deep-diff'
import SyncTest from '../tests/onlinesync'
import request from 'request'
import { config } from '../config'
import { RequestError, RemoteTokenMismatchError } from '../utils/errors'

class Sync {
    static getRemoteData(token, callback) {
        const url = config.syncUrl + token
        return request(url, (err, incoming, res) => {
            if (err) {
                throw new RequestError(url, null, err)
            } else {
                if (incoming.statusCode == 404) {
                    callback({error: 'Invalid key', statusCode: 404})
                } else if (incoming.statusCode == 200) {
                    callback({statusCode: 200, msg: JSON.parse(res)})
                } else {
                    throw new RequestError(url, null, res)
                }
            }
        })
    }

    static updateRemoteDataWithLocal(token, callback) {
        const url = config.syncUrl + token
        const data = {notesObj: JSON.stringify(this.getLocalData())}
        return request.post(url, {form: data}, (err, incoming, res) => {
            if (err) {
                throw new RequestError(url, data, err)
            } else {
                if (incoming.statusCode == 500) {
                    callback({error: 'Unable to update remote with latest changes.', statusCode: 500})
                } else if (incoming.statusCode == 200) {
                    callback({statusCode: 200, msg: res})
                } else {
                    throw new RequestError(url, data, res)
                }
            }
        })
    }

    static getLocalData() {
        return {
            "notes": DBManager.getAllNotes(),
            "notesOrdering": DBManager.getNotesOrdering(),
            "notesOrderingTimestamp": DBManager.getNotesOrderingTimestamp(),
            "token": DBManager.getCurrentToken()
        }
    }

    static merge(localData = this.getLocalData(), remoteData = null) {
        if (remoteData.token != localData.token) {
            if (remoteData.token != null) {
                throw new RemoteTokenMismatchError(localData.token, remoteData.token)
            }
            return [localData.notes, localData.notesOrdering]
        }

        const {
            notes: localNotes, notesOrdering: localOrdering,
            notesOrderingTimestamp: localOrderingTimestamp
        } = localData
        const {
            notes: remoteNotes, notesOrdering: remoteOrdering,
            notesOrderingTimestamp: remoteOrderingTimestamp
        } = remoteData

        let newOrder
        if (remoteOrderingTimestamp > localOrderingTimestamp) {
            newOrder = remoteOrdering
        } else {
            newOrder = localOrdering
        }

        /*
         After this finishes, each note in localData will be updated with data from
         remoteData if the remote note has a later timestamp than the local note
         */
        deepDiff.observableDiff(localNotes, remoteNotes, (d) => {
            const noteId = d.path[0]
            const localNote = localNotes[noteId]
            const remoteNote = remoteNotes[noteId]

            if (
                localNote && !localNote.deleted && remoteOrderingTimestamp > localOrderingTimestamp &&
                newOrder.indexOf(noteId) == -1
            ) {
                newOrder.push(noteId)
                return
            } else if (!localNote) {
                deepDiff.applyChange(localNotes, remoteNotes, d)

                /*
                 If there was no local equivalent, and the remote note is not deleted,
                 then we want to push it into the order.
                 We dont have to check that the item is already in the order because of two factors:
                 1. We are not using the remote ordering (remoteOrderingTimestamp < localOrderingTimestamp)
                 AND
                 2. Any time there isnt a corresponding local note, the diff wont recognize more than a single new item,
                 no matter how many properties it has. So this can never be called once if !localNote. Therefore no dups.
                 */
                if (remoteNote.deleted !== true && remoteOrderingTimestamp < localOrderingTimestamp) {
                    newOrder.push(noteId)
                }
                return
            }

            const localTimestamp = localNote.timestamp
            const remoteTimestamp = remoteNote.timestamp

            if (remoteTimestamp > localTimestamp) {
                deepDiff.applyChange(localNotes, remoteNotes, d)
            }
        })

        for(let i = 0; i < newOrder.length; i++) {
            let noteId = newOrder[i]
            if(localNotes.hasOwnProperty(noteId) && localNotes[noteId].deleted === true) {
                newOrder.splice(i, 1)
                i++
            }

        }

        return [localNotes, newOrder]
    }

    static sync(callback) {
        const localData = this.getLocalData()

        const mergedDataPromise = new Promise((resolve, reject) => {
            this.getRemoteData(localData.token, (res) => {
                if (res.error) {
                    callback(res)
                } else {
                    const merged = this.merge(localData, res.msg)
                    res.msg = merged
                    resolve(res)
                }
            })
        })
        mergedDataPromise.then((res) => {
            const [mergedNotes, mergedOrdering] = res.msg
            DBManager.setNotes(mergedNotes, mergedOrdering)
            callback(res)
        })
    }
}

// For CLI testing
window.st = SyncTest
window.dd = deepDiff
window.Sync = Sync
export default Sync
