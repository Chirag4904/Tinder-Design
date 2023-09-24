import { readFileSync } from "fs";

export const seedMongodb = async function (mongoClient) {
  try {
    // Use the database
    const db = mongoClient.db("tinder");

    const rawData = readFileSync("seeder.json", "utf8");
    const data = JSON.parse(rawData);
    console.log("seeding data");

    // Insert data into a collection (e.g., "users")
    const collection = db.collection("users");
    const result = await collection.insertMany(data);
    console.log("data seeded");
  } catch (err) {
    console.error(err);
  } finally {
    // Close the connection
    mongoClient.close();
  }
};

export const seedRedisGeo = async function (redisClient) {
  try {
    const rawData = readFileSync("seeder.json", "utf8");
    const data = JSON.parse(rawData);
    console.log("seeding data in redis");

    for (const user of data) {
      const { id, lat, lng } = user;
      const customCommand = [
        "GEOADD",
        "tinder",
        "NX",
        lng.toString(),
        lat.toString(),
        id.toString(),
      ];
      const res = await redisClient.sendCommand(customCommand);
    }

    console.log("data seeded");
  } catch (err) {
    console.error(err);
  }
};

export const seedRedisBloom = async function (redisClient) {
  try {
    const rawData = readFileSync("seeder.json", "utf8");
    const data = JSON.parse(rawData);
    console.log("seeding data in redis bloom");

    for (const user of data) {
      const { id } = user;
      const customCommand = ["BF.RESERVE", id.toString(), "0.01", "1000"];
      const res = await redisClient.sendCommand(customCommand);
    }
    console.log("data seeded in redis bloom");
  } catch (err) {
    console.error(err);
  }
};
