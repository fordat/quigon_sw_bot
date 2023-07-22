import blue from "@atproto/api";
import fs from "node:fs";
import dotenv from "dotenv";
import cron from "node-cron";
import express from "express";
import axios from "axios";

dotenv.config();

const app = express();

const { BskyAgent } = blue;

const BLUESKY_BOT_USERNAME = process.env.APP_USERNAME
const BLUESKY_BOT_PASSWORD = process.env.APP_PASSWORD

const fileName = "./quotes.json";

const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const generateQuiGonQuote = async () => {
  const file = fs.readFileSync(fileName);
  const fileContent = JSON.parse(file);
  console.log("quote file length: ", fileContent.body.length);
  let randomInt = randomIntFromInterval(0, fileContent.body.length - 1);
  console.log("random quote interval: ", randomInt);
  console.log("randomly selected quote: ", fileContent.body[randomInt]);

  let randomQuote = fileContent.body[randomInt];

  // quote received

  const { RichText } = blue;
  const agent = new BskyAgent({ service: "https://bsky.social/"});
  await agent.login({
    identifier: BLUESKY_BOT_USERNAME,
    password: BLUESKY_BOT_PASSWORD,
  });

  const rt = new RichText({ text: randomQuote });
  const postRecord = {
    $type: "app.bsky.feed.post",
    text: rt.text,
    facets: rt.facets,
    createdAt: new Date().toISOString(),
  };
  await agent.post(postRecord);
};

cron.schedule('*/25 * * * *', () => {
  console.log("Pinging to stay awake...")
  axios.get('https://api.publicapis.org/entries');
})

cron.schedule('0 * * * *', () => {
  generateQuiGonQuote();
});

cron.schedule('*/10 * * * * *', () => {
  console.log("Running...")
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Application listening...");
})