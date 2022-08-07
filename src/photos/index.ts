import express, { Request, Response } from 'express'
import { Document, MongoError } from 'mongodb'
import { getDb } from '../config/db'
import { InternalServerError } from '../utils/errorHandling'
import { Photo } from './model'

const router = express.Router()
const db = getDb()
const photos = db.collection('photos')

router.route("/")
  .get((req: Request, res: Response) => {
    photos.find({}).toArray((error: MongoError, result?: Document[]) => {
      if(error) {
        res.status(500).json(new InternalServerError())
        throw error
      }

      res.json(result as Photo[])
    })
  })

module.exports = router