import "dotenv/config";
import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(process.env.MONGODB_URL);
mongoClient.on("error", (err) => console.log("Mongo Client Error", err));
mongoClient.on("serverOpening", () => console.log("Mongo Client Ready"));
export default mongoClient;
