import express from "express";
import bodyParser from "body-parser";
import { seedMongodb, seedRedisGeo, seedRedisBloom } from "./util.js";
import { redisGeoClient, redisBloomClient } from "./redisConfig.js";
import mongoClient from "./mongoConfig.js";
import prisma from "./mysqlConfig.js";

import "dotenv/config";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 5000;

redisGeoClient.connect();
redisBloomClient.connect();
mongoClient.connect();

app.get("/nearby/:id", async (req, res) => {
  const { id } = req.params;
  const customCommand = [
    "GEOSEARCH",
    "tinder",
    "FROMMEMBER",
    id.toString(),
    "BYRADIUS",
    "30",
    "km",
    "ASC",
    "WITHCOORD",
    "WITHDIST",
  ];

  const nearbyUsers = await redisGeoClient.sendCommand(customCommand);

  const nearbyUsersIds = nearbyUsers
    .filter((user, idx) => idx > 0)
    .map((user) => +user[0]);

  for (const userId of nearbyUsersIds) {
    const existCommand = ["BF.EXISTS", id.toString(), userId.toString()];
    const existRes = await redisBloomClient.sendCommand(existCommand);

    if (existRes === 1) continue;

    const addCommand = ["BF.ADD", id.toString(), userId.toString()];
    const res = await redisBloomClient.sendCommand(addCommand);
    const feed = await prisma.feeds.create({
      data: {
        USER_A_ID: +id,
        USER_B_ID: +userId,
      },
    });
    console.log(feed);
  }
  // console.log(nearbyUsersIds);

  res.send("ok").status(200);
});

app.get("/feeds/:id", async (req, res) => {
  const { id } = req.params;
  // find all feed where USER_A_ID =id and LIKED = NULL
  const feeds = await prisma.feeds.findMany({
    where: {
      USER_A_ID: +id,
      Liked: null,
    },
  });

  const candidateIds = feeds.map((feed) => feed.USER_B_ID);
  const db = mongoClient.db("tinder");
  const collection = db.collection("users");
  const users = await collection.find({ id: { $in: candidateIds } }).toArray();

  res.send(users).status(200);
});

app.get("/pos/:id", async (req, res) => {
  const { id } = req.params;
  const customCommand = ["GEOPOS", "tinder", id.toString()];
  const result = await redisGeoClient.sendCommand(customCommand);
  res.send(result).status(200);
});

app.post("/like", async (req, res) => {
  // console.log(req);
  try {
    const { id, liked, candidateId } = req.body;
    const updateFeed = await prisma.feeds.update({
      where: {
        USER_A_ID_USER_B_ID: {
          USER_A_ID: +id,
          USER_B_ID: +candidateId,
        },
      },
      data: {
        Liked: liked,
      },
    });
    res.send(updateFeed).status(200);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Error");
  }
});

app.post("/updateLoc/:id", async (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.body;
  const customCommand = [
    "GEOADD",
    "tinder",
    "XX",
    lng.toString(),
    lat.toString(),
    id.toString(),
  ];
  const result = await redisGeoClient.sendCommand(customCommand);
  res.send(result).status(200);
});
// Start the Express server
app.listen(port, async () => {
  console.log(`server started at http://localhost:${port}`);
  // const command = ["BF.EXISTS", "7", "988"];
  // const res = await redisBloomClient.sendCommand(command);
  // console.log(res);
  // seedMongodb(mongoClient);
});
