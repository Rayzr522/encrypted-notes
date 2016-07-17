import Sync from '../backend/onlinesync'
import { toEmptyDicts } from '../utils/helpers'
import deepDiff from 'deep-diff'

/*
 e: expected
 N: Notes
 a: actual
 O: Order
  */
class SyncTest {
    static log(testNum, ...args) {
        if (!this.toDebug) {
            this.toDebug = new Set()
        }
        if (this.toDebug.has(testNum)) {
            console.log(testNum, ...args)
        }
    }

    static runTests(testsToDebug = []) {
        this.toDebug = new Set(testsToDebug)

        this.test1()
        this.test2()
        this.test3()
        this.test4()
    }

    static checkTest(testNum, eN, eO, aN, aO) {
        if (deepDiff(eN, aN) === undefined) {
            this.log(testNum, 'Notes worked (e, a)', eN, aN)
        } else {
            console.error(testNum, 'notes didnt work (e, a)', eN, aN)
        }
        if (deepDiff(eO, aO) === undefined) {
            this.log(testNum, 'Order worked (e, a)', eO, aO)
        } else {
            console.error(testNum, 'order didnt work (e, a)', eO, aO)
        }
        this.debug = false
    }

    /*
    Both have new notes, remote ordering wins
     */
    static test1() {
        let localData = {
            notes: toEmptyDicts('abf'),
            notesOrdering: 'abf'.split(''),
            notesOrderingTimestamp: 1
        }
        let remoteData = {
            notes: toEmptyDicts('acd'),
            notesOrdering: 'adc'.split(''),
            notesOrderingTimestamp: 2
        }
        let expectedNotes = toEmptyDicts('abcdf')
        let expectedOrder = 'adcbf'.split('')
        const [notes, order] = Sync.merge(localData, remoteData)
        this.checkTest(1, expectedNotes, expectedOrder, notes, order)
    }

    static test2() {
        let localData = {
            notes: toEmptyDicts('aBc'),
            notesOrdering: 'ac'.split(''),
            notesOrderingTimestamp: 2
        }
        // assume all remote notes have earlier timestamps
        let remoteData = {
            notes: toEmptyDicts('abc'),
            notesOrdering: 'abc'.split(''),
            notesOrderingTimestamp: 1
        }
        let expectedNotes = toEmptyDicts('aBc')
        let expectedOrder = 'ac'.split('')
        const [notes, order] = Sync.merge(localData, remoteData)
        this.checkTest(2, expectedNotes, expectedOrder, notes, order)
    }

    static test3() {
        let localData = {
            notes: {
                a: {deleted: true, timestamp: 2},
                b: {timestamp: 2}
            }, notesOrdering: ['b'],
            notesOrderingTimestamp: 1
        }
        let remoteData = {
            notes: {
                a: {timestamp: 1},
                b: {deleted: true, timestamp: 1}
            }, notesOrdering: ['b', 'a'],
            notesOrderingTimestamp: 2
        }
        let expectedNotes = {
            a: {deleted: true, timestamp: 2},
            b: {timestamp: 2}
        }
        let expectedOrdering = ['b']
        const [notes, order] = Sync.merge(localData, remoteData)
        this.checkTest(3, expectedNotes, expectedOrdering, notes, order)
    }

    static test4() {
        let localData = {
            notes: {
                a: {timestamp: 2},
                b: {timestamp: 2, text: 'encrypted'}
            }, notesOrdering: ['a', 'b'],
            notesOrderingTimestamp: 1
        }
        let remoteData = {
            notes: {
                a: {timestamp: 1, deleted: true},
                b: {timestamp: 1, text: 'hey'},
                c: {}, d: {deleted: true}, f: {deleted: false, text: ''}
            }, notesOrdering: ['b', 'c', 'f'],
            notesOrderingTimestamp: 2
        }
        let expectedNotes = {
            a: {timestamp: 2},
            b: {timestamp: 2, text: 'encrypted'},
            c: {}, d: {deleted: true}, f: {deleted: false, text: ''}
        }
        let expectedOrdering = ['b', 'c', 'f', 'a']
        const [notes, order] = Sync.merge(localData, remoteData)
        this.checkTest(4, expectedNotes, expectedOrdering, notes, order)
    }
}
window.toEmptyDicts = toEmptyDicts
export default SyncTest

/*
Some test data
 {
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
 */