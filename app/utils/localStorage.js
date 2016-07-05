/*
    Most of this is copied from: https://github.com/marcuswestin/store.js/blob/master/store.js
    The MIT License (MIT)

    Copyright (c) 2010-2014 Marcus Westin

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
*/
var store = {};
store.serialize = function(value) {
    return JSON.stringify(value)
}
store.deserialize = function(value) {
    if (typeof value != 'string') { return undefined }
    try { return JSON.parse(value) }
    catch(e) { return value || undefined }
}
store.remove = function(key) { localStorage.removeItem(key) }
store.has = function(key) { return store.get(key) !== undefined }
store.set = function(key, val) {
    if (val === undefined) { return store.remove(key) }
    localStorage.setItem(key, store.serialize(val))
    return val
}
store.get = function(key, defaultVal) {
    var val = store.deserialize(localStorage.getItem(key))
    return (val === undefined ? defaultVal : val)
}
store.getAll = function() {
    var ret = {}
    store.forEach(function(key, val) {
        ret[key] = val
    })
    return ret
}
store.forEach = function(callback) {
    for (var i=0; i<localStorage.length; i++) {
        var key = localStorage.key(i)
        callback(key, store.get(key))
    }
}
store.func = function(key, defaultVal, transactionFn) {
    if (transactionFn == null) {
        transactionFn = defaultVal
        defaultVal = null
    }
    if (defaultVal == null) {
        defaultVal = {}
    }
    var val = store.get(key, defaultVal)
    val = transactionFn(val)
    store.set(key, val)
}
module.exports = store;
