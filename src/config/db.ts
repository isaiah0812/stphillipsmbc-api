import { MongoClient, Db } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config()

const url = process.env.MONGO_URL as string;
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