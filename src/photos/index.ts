import express, { Request, Response } from 'express'
import { Document, MongoError, MongoServerError, ObjectId } from 'mongodb'
import { ADMIN_SCOPE, checkJwt } from '../config/auth'
import { cloud } from '../config/cloudinary'
import { getDb } from '../config/db'
import { InternalServerError, NotFoundError, ValidationError } from '../utils/errorHandling'
import { CreatePhotoForm, Photo, PhotoForm, UpdatePhotoForm } from './model'
import multer from 'multer';
import { BSONTypeError } from 'bson'

const Blob = require('buffer').Blob;

const router = express.Router()
const db = getDb()
const photos = db.collection('photos')
const upload = multer({ storage: multer.memoryStorage() });

router.route("/")
  .get((req: Request, res: Response) => {
    photos.find({}).toArray((error: MongoError, result?: Document[]) => {
      if(error) {
        res.status(500).json(new InternalServerError(error))
        throw error
      }

      res.json(result as Photo[])
    })
  }).post(checkJwt, ADMIN_SCOPE, upload.single('source'), async (req: Request<{}, {}, CreatePhotoForm>, res: Response) => {
    try {
      const blob = new Blob([req.file!.buffer]);
      const reader = (blob.stream() as ReadableStream<Uint8Array>).getReader();

      let photoBytes: Uint8Array = new Uint8Array(blob.size);
      let readBytes;

      do {
        readBytes = await reader.read()
        if (readBytes.value) photoBytes.set(readBytes.value, readBytes.value.byteOffset)
      } while (readBytes && !readBytes.done)

      const dataLink = `data:image/png;base64,${Buffer.from(photoBytes).toString('base64')}`
      const uploadResult = await cloud.uploader.upload(dataLink, { public_id: req.file!.filename, folder: 'spmbc/gallery' })

      const { name, description } = req.body
      const photo = new Photo({ name, description, url: uploadResult.secure_url, cloud_id: uploadResult.public_id })
      console.info("Adding new Photo:", photo);

      await photos.insertOne(photo);
      res.status(201).json(photo);
    } catch (e: any) {
      if (e instanceof MongoServerError) {
        console.error(`MongoServerError: ${e.message}`)
        res.status(500).json(new InternalServerError(e))
      } else {
        console.error(e);
        res.status(500).json(new InternalServerError(e));
      }
    }
  })

router.route("/:id")
  .delete(checkJwt, ADMIN_SCOPE, async (req: Request, res: Response) => {
    const id: string = req.params.id
    try {
      const foundPhoto: Photo | null = await photos.findOne<Photo>({ _id: new ObjectId(id) })

      if (!foundPhoto) {
        console.error("Photo not found -", id)
        throw new NotFoundError(`Photo ID ${id} was not found.`, id)
      }

      if (foundPhoto.cloud_id) await cloud.uploader.destroy(foundPhoto.cloud_id);
      await photos.deleteOne({ _id: new ObjectId(id) });

      const allPhotos = await photos.find<Photo>({}).toArray();
      res.status(200).json(allPhotos);
    } catch(e: any) {
      if (e instanceof NotFoundError) {
        res.status(404).send(e);
      } else if (e instanceof MongoServerError) {
        console.error(`MongoServerError: ${e.message}`)
        res.status(500).json(new InternalServerError(e))
      } else if (e instanceof BSONTypeError) {
        console.error(`BSONTypeError - ${e.message}`)
        res.status(400).json(new ValidationError("Invalid ID", "ID must be a 12 byte string, a string of 24 hex characters, or an integer"))
      } else {
        console.error(e);
        res.status(500).json(new InternalServerError(e));
      }
    }
  }).put(checkJwt, ADMIN_SCOPE, async (req: Request<{ id: string }, {}, UpdatePhotoForm>, res: Response) => {
    const id: string = req.params.id
    try {
      const foundPhoto: Photo | null = await photos.findOne<Photo>({ _id: new ObjectId(id) })

      if (!foundPhoto) {
        console.error("Photo not found -", id)
        throw new NotFoundError(`Photo ID ${id} was not found.`, id)
      }

      const photo: Photo = Photo.copy(foundPhoto)
      const input: UpdatePhotoForm = req.body as UpdatePhotoForm

      console.info(`Updating event ${id} with fields:`, input)

      const options: Partial<Document> = {}

      if (input.name === '') {
        if (!options['$unset']) options['$unset'] = {};

        options['$unset'].name = '';
      } else if (input.name) {
        if (!options['$set']) options['$set'] = {};

        options['$set'].name = input.name;
      }

      if (input.description === '') {
        if (!options['$unset']) options['$unset'] = {};
        
        options['$unset'].description = '';
      } else if (input.description) {
        if (!options['$set']) options['$set'] = {};
        
        options['$set'].description = input.description;
      }

      photo.update(input)
      await photos.updateOne({ _id: new ObjectId(id) }, options);
      res.status(200).json(photo)
    } catch(e: any) {
      if (e instanceof MongoServerError) {
        console.error(`MongoServerError: ${e.message}`)
        res.status(500).json(new InternalServerError(e));
      } else if (e instanceof BSONTypeError) {
        console.error(`BSONTypeError - ${e.message}`)
        res.status(400).json(new ValidationError("Invalid ID", "ID must be a 12 byte string, a string of 24 hex characters, or an integer"))
      } else if (e instanceof NotFoundError) {
        res.status(404).json(e)
      } else {
        console.error(e);
        res.status(500).json(new InternalServerError(e));
      }
    }
  })

module.exports = router