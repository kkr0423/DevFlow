import mongoose, { Mongoose } from "mongoose";
import logger from "./logger";

import "@/database";

const MONOGODB_URI = process.env.MONGODB_URI as string;

if (!MONOGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

interface MongooseCache {
  //Connecting for MongoDB
  conn: Mongoose | null;
  //Promise for connecting
  promise: Promise<Mongoose> | null;
}

//Hold the cached in the global
declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

//If the cache is not in the global
if (!cached) {
  //Initialize the cache
  cached = global.mongoose = { conn: null, promise: null };
}

//Connect MongoDB
const dbConnect = async (): Promise<Mongoose> => {
  //If chache exists in DNS?
  if (cached.conn) {
    logger.info("Using existing mongoose connection");
    //Return the cached data
    return cached.conn;
  }

  //If chache doesn't exist in DNS?
  if (!cached.promise) {
    //Connect to MongoDB
    cached.promise = mongoose
      .connect(MONOGODB_URI, {
        dbName: "NextjsDevFlow"
      })
      .then((result) => {
        logger.info("Connected to MongoDB");
        return result;
      })
      .catch((error) => {
        logger.error("Error connecting to MongoDB", error);
        throw error;
      });
  }

  //Insert to the result of the promise
  cached.conn = await cached.promise;

  //Return the new Connection for MongoDB
  return cached.conn;
};

export default dbConnect;
