class ExtendableError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }

    toString() {
        return `[object ${this.name}]`
    }

    dsp() {
        return `${this.toString()} -> ${this.stack}`
    }
}
class FatalError extends ExtendableError {
    constructor(err = null, msg = `Please contact yonilerner@gmail.com for assistance. Error is: ${err}.`) {
        super(msg)
    }
}
class SevereError extends ExtendableError {
    constructor(msg) {
        super(msg)
    }
}
class UserError extends ExtendableError {
    constructor(msg) {
        super(msg)
    }
}

class IncorrectPasswordError extends UserError {
    constructor(msg = 'The password you entered is not correct.') {
        super(msg)
    }
}
class PasswordsDoNotMatchError extends UserError {
    constructor(msg = 'The two passwords you entered do not match.') {
        super(msg)
    }
}
class NoteAlreadyExistsError extends SevereError {
    constructor(noteId = null, msg = `The note ${noteId} already exists in the database.`) {
        super(msg)
    }
}
class CannotDeleteNoteError extends UserError {
    constructor(noteId = null, msg = `You cannot delete note ${noteId}`) {
        super(msg)
    }
}
class InvalidScreenError extends SevereError {
    constructor(screenId = null, msg = `Screen ${screenId} is invalid.`) {
        super(msg)
    }
}
class RequestError extends SevereError {
    constructor(url = null, data = null, err = null, msg = `Error with request to ${url} with data: ${data}. -- ${err} --`) {
        super(msg)
    }
}
class RemoteTokenMismatchError extends SevereError {
    constructor(localToken = null, remoteToken = null, msg = `Local token ${localToken} did not match remote token ${remoteToken}`) {
        super(msg)
    }
}
class ValidationError extends UserError {
    constructor(input = '<hidden>', msg = `The value (${input}) was not a valid input!`) {
        super(msg)
    }
}
class DatabaseIntegrityError extends FatalError {
    constructor(msg = 'The database is in a corrupt state.') {
        super(undefined, msg)
    }
}
class UnknownError extends FatalError {
    constructor(err = null, msg = `UnkownError! Message: ${err}`) {
        super(undefined, msg)
    }
}
window.SevereError = SevereError
window.UserError = UserError
window.FatalError = FatalError
export {
    ExtendableError,
    IncorrectPasswordError, PasswordsDoNotMatchError, NoteAlreadyExistsError, CannotDeleteNoteError, DatabaseIntegrityError,
    InvalidScreenError, RequestError, RemoteTokenMismatchError, UnknownError, ValidationError, FatalError, SevereError, UserError
}