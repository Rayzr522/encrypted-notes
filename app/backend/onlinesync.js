import DBManager from './db'
import deepDiff from 'deep-diff'
import { diffKinds } from '../utils/constants'
import SyncTest from '../tests/onlinesync'

class Sync {
    static getRemoteData(token) {
        return {
            "notes": {
                "f1ffff6d-a4c2-4f5f-88f0-1da4a7384a12": {
                    "id": "f1ffff6d-a4c2-4f5f-88f0-1da4a7384a12",
                    "title": "First (Orig)",
                    "text": "<p>some text</p>",
                    "locked": false,
                    "timestamp": 1467937494042
                },
                "6bbe5ca3-8e0d-497b-a1ba-024396345979": {
                    "id": "6bbe5ca3-8e0d-497b-a1ba-024396345979",
                    "title": "Second (Orig)",
                    "text": "Fe26.2**71621787eee319ac446197910d558ec2ea392d1496b69c415f3a4d4fb0413312*8e_2Ll3MP43qqI4JaEID8g*FjC_rPjlzp1rUjth4eNdXsQZJjrmcwvbkiR2zTdbt5Y**fa175e7e1ce84347a3b5245be29a5a475c0fef6dfb02566fda6fbfd42a0e1cab*WhNfJciKkWmREUYlVOGMZiqsvHDoD0cD_U5dsGS97bI",
                    "locked": true,
                    "timestamp": 1467937616191
                },
                "18f2b1e6-444c-4981-876e-82b459d25e5e": {
                    "id": "18f2b1e6-444c-4981-876e-82b459d25e5e",
                    "locked": false,
                    "timestamp": 1467937548590,
                    "title": "to delete yo",
                    "text": "Fe26.2**8f9a5ec33d9122c996dd2ac15fae70e1a9fd9630d8840e343fc2d8e4a893e7ea*dupIWuAFhfDOatR2ecDsiw*KiZbCYJEuGsKOR_fRwz8dnxbxRo7xXvh0JxZJfz-hhI**584c5b183bd7f2114763610ff3a8dc1485ba098b511141ea04035d11af68381d*VZxvATygv3f3Vr-lvf2GmscoGK9CxG23yI1VPrTiY3A",
                    "deleted": true
                }
            },
            "notesOrdering": [
                "f1ffff6d-a4c2-4f5f-88f0-1da4a7384a12",
                "6bbe5ca3-8e0d-497b-a1ba-024396345979"
            ],
            "notesOrderingTimestamp": Date.now(),
            "token": DBManager.getCurrentToken()
        }
    }

    static getLocalData() {
        return {
            "notes": DBManager.getAllNotes(),
            "notesOrdering": DBManager.getNotesOrdering(),
            "notesOrderingTimestamp": DBManager.getNotesOrderingTimestamp(),
            "token": DBManager.getCurrentToken()
        }
    }



    static sync(localData = this.getLocalData(), remoteData = this.getRemoteData(localData.token)) {
        if (remoteData.token != localData.token) {
            console.error(`Local token is ${localData.token} but remote token is ${remoteData.token}!`)
            return
        }

        const {
            notes: localNotes, notesOrdering: localOrdering,
            notesOrderingTimestamp: localOrderingTimestamp
        } = localData
        const {
            notes: remoteNotes, notesOrdering: remoteOrdering,
            notesOrderingTimestamp: remoteOrderingTimestamp
        } = remoteData


        let newOrder, diffKind
        if (remoteOrderingTimestamp > localOrderingTimestamp) {
            newOrder = remoteOrdering
            diffKind = diffKinds.DEL
        } else {
            newOrder = localOrdering
            diffKind = diffKinds.NEW
        }


        //let changesMade = new Set(newOrder)
        //changesMade.add(noteId)

        /*
         After this finishes, each note in localData will be updated with data from
            remoteData if the remote note has a later timestamp than the local note
          */
        deepDiff.observableDiff(localNotes, remoteNotes, (d) => {
            const noteId = d.path[0]
            const localNote = localNotes[noteId]
            const remoteNote = remoteNotes[noteId]

            if (!remoteNote) {
                /*
                If there was no remote quivalent, but we are using the remote ordering to start,
                then we need to push the local note into the order
                 */
                if (remoteOrderingTimestamp > localOrderingTimestamp && newOrder.indexOf(noteId) == -1) {
                    newOrder.push(noteId)
                }
                return
            }

            // If there was no local equivalent, then apply the addition
            if (!localNote) {
                deepDiff.applyChange(localNotes, remoteNotes, d)

                /*
                If there was no local equivalent, and the remote note is not deleted,
                then we want to push it into the order
                 */
                if (remoteNote.deleted !== true && newOrder.indexOf(noteId) == -1) {
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

    static handleChanges() {

    }
}

// For CLI testing
window.st = SyncTest
window.dd = deepDiff
window.Sync = Sync
export default Sync