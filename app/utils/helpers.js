// t is short for ternary, and replaces a ? a : b
let t = (a, b) => a ? a : b

let type = (obj) =>
    Object.prototype.toString.call(obj).match(/\[object (\w+)\]/)[1]

let truthyStr = (str) =>
    type(str) == 'String' &&  str.trim().length > 1

let sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

let validateUUID = (str) =>
    str.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/) != null

let objToArr = (obj) =>
    Object.keys(obj).map((key) => obj[key])
window.objToArr = objToArr


// Probably wont end up needing this
let getValAtPath = (path, obj) => {
    let val = obj
    for(let i = 0; i < path.length; i++) {
        val = val[path[i]]
    }
    return val
}


// toEmptyDicts('abcd') -> {a:{}, b:{}, c:{}, d:{}}
let toEmptyDicts = (str) => {
    const res = {}
    str.split('').forEach((char) => {
        let lower = char.toLowerCase()
        if (lower == char) {
            res[lower] = {deleted: false, text: ''}
        } else {
            res[lower] = {deleted: true, text: ''}
        }
    })
    return res
}


export {t, type, truthyStr, sleep, validateUUID, objToArr, toEmptyDicts }