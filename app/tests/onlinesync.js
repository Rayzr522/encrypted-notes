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
            this.log(testNum, 'Notes worked', eN, aN)
        } else {
            console.error(testNum, 'notes didnt work', eN, aN)
        }
        if (deepDiff(eO, aO) === undefined) {
            this.log(testNum, 'Order worked', eO, aO)
        } else {
            console.error(testNum, 'order didnt work', eO, aO)
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
        const [notes, order] = Sync.sync(localData, remoteData)
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
        const [notes, order] = Sync.sync(localData, remoteData)
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
        const [notes, order] = Sync.sync(localData, remoteData)
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
                c: {}, d: {deleted: true}, f: {}
            }, notesOrdering: ['b', 'c', 'f'],
            notesOrderingTimestamp: 2
        }
        let expectedNotes = {
            a: {timestamp: 2},
            b: {timestamp: 2, text: 'encrypted'},
            c: {}, d: {deleted: true}, f: {}
        }
        let expectedOrdering = ['b', 'c', 'f', 'a']
        const [notes, order] = Sync.sync(localData, remoteData)
        this.checkTest(4, expectedNotes, expectedOrdering, notes, order)
    }
}
window.toEmptyDicts = toEmptyDicts
export default SyncTest