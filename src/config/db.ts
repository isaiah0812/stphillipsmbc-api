import { MongoClient, Db } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config()

const url = process.env.NODE_ENV === 'production'
  ? `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@spmbc.juctnny.mongodb.net/?retryWrites=true&w=majority`
  : 'mongodb://localhost:27017';

const client = new MongoClient(url);

console.log(`Connecting to MongoDB at ${url}`);
let db: Db;

export const connectDb = async (): Promise<void> => {
  try {
    await client.connect()

    db = client.db('spmbc');
    console.log('Connected to mongo server.');
  } catch(connErr: any) {
    console.error('Error connecting to mongo server.');
    throw connErr
  }
}

export const getDb = (): Db => {
  return db;
}