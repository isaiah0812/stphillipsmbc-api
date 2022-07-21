import express, { NextFunction, Request, Response } from 'express'
import { getDb } from '../config/db'
import { checkJwt } from '../config/auth'
import { Document, MongoError, MongoServerError, ObjectId } from 'mongodb'
import { Event, EventForm } from './model'
import { InternalServerError, NotFoundError, ValidationError } from '../utils/errorHandling'
import { BSONTypeError } from 'bson'

const router = express.Router()
const db = getDb()
const events = db.collection('events')

router.route("/")
  .get((req: Request, res: Response) => {
    events.find({}).toArray((error: MongoError, result?: Document[]) => {
      if(error) {
        res.status(500).json(new InternalServerError());
        throw error;
      }

      res.json(result as Event[] | undefined);
    })
  })
  .post(checkJwt, async (req: Request<{}, {}, EventForm>, res: Response) => {
    try {
      const event: Event = new Event(req.body as EventForm);

      console.log("Adding new event:", event)
  
      await events.insertOne(event);
      res.status(201).json(event);
    } catch(e: any) {
      if (e instanceof MongoServerError) {
        console.error(`MongoServerError: ${e.message}`)
        res.status(500).json(new InternalServerError(e))
      } else if (e instanceof ValidationError) {
        console.error(`ValidationError - ${e.title}: ${e.message}`)
        res.status(400).json(e)
      } else {
        console.error(e)
        throw e
      }
    }
  })

router.route("/:id")
  .put(checkJwt, async (req: Request<{ id: string }, {}, EventForm>, res: Response) => {
    try {
      const id: string = req.params.id
      const foundEvent: Event | null = await events.findOne<Event>({ _id: new ObjectId(id) })
      
      if(!foundEvent) {
        console.error("Event Not Found -", id)
        throw new NotFoundError(`Event ID ${id} was not found.`, id)
      }

      const event: Event = Event.copy(foundEvent)
      const input: EventForm = req.body as EventForm
      console.info(`Updating event ${id} with fields:`, input)

      event.update(input)
      await events.updateOne({ _id: new ObjectId(id) }, { $set: event })
      res.status(200).json(input)
    } catch(e: any) {
      if (e instanceof MongoServerError) {
        console.error(`MongoServerError: ${e.message}`)
        res.status(500).json(new InternalServerError(e))
      } else if (e instanceof BSONTypeError) {
        console.error(`BSONTypeError - ${e.message}`)
        res.status(400).json(new ValidationError("Invalid ID", "ID must be a 12 byte string, a string of 24 hex characters, or an integer"))
      } else if (e instanceof NotFoundError) {
        res.status(404).json(e)
      } else if (e instanceof ValidationError) {
        console.error(`${e.title} - ${e.message}`)
        res.status(400).json(e)
      } else {
        console.error(e)
        res.status(500).json(new InternalServerError(e))
      }
    }
  })
  .delete(checkJwt, async (req: Request<{ id: string }, {}, {}>, res: Response) => {
    try {
      const id: string = req.params.id
      
      const result = await events.deleteOne({ _id: new ObjectId(id) })

      if (result.deletedCount === 1) {
        const allEvents: Event[] = await events.find<Event>({}).toArray()
        res.status(200).json(allEvents)
      } else {
        console.error("Event Not Found -", id)
        throw new NotFoundError(`Event ID ${id} was not found.`, id)
      }
    } catch(e: any) {
      if (e instanceof MongoServerError) {
        console.error(`MongoServerError: ${e.message}`)
        res.status(500).json(new InternalServerError(e))
      } else if (e instanceof BSONTypeError) {
        console.error(`BSONTypeError - ${e.message}`)
        res.status(400).json(new ValidationError("Invalid ID", "ID must be a 12 byte string, a string of 24 hex characters, or an integer"))
      } else if (e instanceof NotFoundError) {
        res.status(404).json(e)
      } else {
        console.error(e)
        res.status(500).json(new InternalServerError(e))
      }
    }
  })
  .get(async (req: Request<{ id: string }, {}, {}>, res: Response, next: NextFunction) => {
    if (req.params.id === "recent") {
      next()
    } else {
      try {
        const id: string = req.params.id
  
        const event: Event | null = await events.findOne<Event>({ _id: new ObjectId(id) })
  
        if (!event) {
          console.error("Event Not Found -", id)
          throw new NotFoundError(`Event ID ${id} was not found.`, id)
        }
  
        res.status(200).json(event)
      } catch(e: any) {
        if (e instanceof MongoServerError) {
          console.error(`MongoServerError: ${e.message}`)
          res.status(500).json(new InternalServerError(e))
        } else if (e instanceof BSONTypeError) {
          console.error(`BSONTypeError - ${e.message}`)
          res.status(400).json(new ValidationError("Invalid ID", "ID must be a 12 byte string, a string of 24 hex characters, or an integer"))
        } else if (e instanceof NotFoundError) {
          res.status(404).json(e)
        } else {
          console.error(e)
          res.status(500).json(new InternalServerError(e))
        }
      }
    }
  })

router.route("/recent")
  .get(async (req: Request, res: Response) => {
    try {
      const allEvents: Event[] = await events.find<Event>({}).toArray()
      
      if (allEvents.length === 0) {
        res.status(204)
      }

      const now = new Date()
      var recent: Event = allEvents[0]
      for (const event of allEvents) {
        if (event.startTime > now && event.startTime < recent.startTime) {
          recent = event
        }
      }

      res.status(200).json(recent)

    } catch (e: any) {
      if (e instanceof MongoServerError) {
        console.error(`MongoServerError: ${e.message}`)
        res.status(500).json(new InternalServerError(e))
      }
    }
  })

module.exports = router