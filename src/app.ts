import express, { Request, Response } from 'express'
import { connectDb } from './config/db';
import cors from 'cors';
import { configCloud } from './config/cloudinary';

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "*",
  credentials: true
}));

const main = async () => {
  try {
    await connectDb();
    configCloud();

    app.use("/events", require("./events"));
    app.use("/photos", require("./photos"));
  
    app.get("/", (req: Request, res: Response) => {
      res.send("Hello World")
    });
  
    app.listen(port, () => {
      console.log(`St. Phillips MBC API listening on port ${port}`)
    });

  } catch(err: any) {
    throw err;
  }
}

main();

// TODO add support for videos
// TODO add OpenAPI spec
// TODO make payloads RESTFul
// TODO common timezone (Central Time)
// TODO batch create events
// TODO batch create photos
// TODO dateAdded field for photos
