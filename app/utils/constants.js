const screens = {
    START: 0,
    EDITOR: 1,
    SYNC: 2
}

const unicodeSymbols = {
    delete: '✗',
    edit: '✎',
    locked: '🔒',
    unlocked: '🔓',
    check: '✓',
    burger: '☰'
}

const keyCodes = {
    ESCAPE: 27,
    ENTER: 13
}

const eventTypes = {
    CLICK: 'click',
    KEYDOWN: 'keydown'
}

const diffKinds = {
    EDIT: 'E',
    NEW: 'N',
    DEL: 'D',
    ARR: 'A'
}

export { screens, unicodeSymbols, keyCodes, eventTypes, diffKinds }