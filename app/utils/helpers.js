// t is short for ternary, and is for a ? a : b
let t = (a, b) => a ? a : b

let type = (obj) =>
    Object.prototype.toString.call(obj).match(/\[object (\w+)\]/)[1]

let truthyStr = (str) =>
    type(str) == 'String' &&  str.trim().length > 1

export {t, type, truthyStr}