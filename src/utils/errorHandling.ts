export class InternalServerError extends Error {
  cause?: Error

  constructor(cause?: Error) {
    super()

    this.cause = cause
    this.message = "Internal Server Error"
  }
}

export class ValidationError extends Error {
  title: string
  
  constructor(title: string, message: string) {
    super()

    this.title = title
    this.message = message
  }
}

export class NotFoundError extends Error {
  attemptedId: string

  constructor(message: string, attemptedId: string) {
    super()

    this.message = message
    this.attemptedId = attemptedId
  }
}