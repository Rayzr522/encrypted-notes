// t is short for ternary, and is for a ? a : b
let t = (a, b) => a ? a : b

let type = (obj) =>
    Object.prototype.toString.call(obj).match(/\[object (\w+)\]/)[1]

let truthyStr = (str) =>
    type(str) == 'String' &&  str.trim().length > 1

let sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

let validateUUID = (str) =>
    str.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/) != null

export {t, type, truthyStr, sleep, validateUUID }