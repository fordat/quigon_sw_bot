import blue from "@atproto/api";
import fs from "node:fs";
import dotenv from "dotenv";
import cron from "node-cron";
import express from "express";
import axios from "axios";

dotenv.config();

const app = express();

app.get('/', (req, res) => {
  return res.status(200).send('Received a GET HTTP method');
});

const { BskyAgent } = blue;

const BLUESKY_BOT_USERNAME = process.env.APP_USERNAME
const BLUESKY_BOT_PASSWORD = process.env.APP_PASSWORD

const fileName = "./quotes.json";

const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const postToBluesky = async (text) => {
  const { RichText } = blue;
  const agent = new BskyAgent({ service: "https://bsky.social/"});
  await agent.login({
    identifier: BLUESKY_BOT_USERNAME,
    password: BLUESKY_BOT_PASSWORD,
  });

  const rt = new RichText({ text: text });
  const postRecord = {
    $type: "app.bsky.feed.post",
    text: rt.text,
    facets: rt.facets,
    createdAt: new Date().toISOString(),
  };
  await agent.post(postRecord);
}

const generateQuiGonQuote = () => {
  const file = fs.readFileSync(fileName);
  const fileContent = JSON.parse(file);
  console.log("quote file length: ", fileContent.body.length);
  let randomInt = randomIntFromInterval(0, fileContent.body.length - 1);
  console.log("random quote interval: ", randomInt);
  console.log("randomly selected quote: ", fileContent.body[randomInt]);

  let randomQuoteObject = fileContent.body[randomInt];

  // quote received
  postToBluesky(randomQuoteObject["english"]);

  // japanese for one hour later
  setInterval(() => {
    postToBluesky(randomQuoteObject["japanese"]);
  }, 3600000);
};

cron.schedule('*/5 * * * *', () => {
  console.log("Pinging to stay awake...")
  axios.get('https://quigon-sw-bot-bf4f7e27a12b.herokuapp.com/');
})

cron.schedule('0 */2 * * *', () => {
  // generateQuiGonQuote();
});

cron.schedule('*/10 * * * * *', () => {
  console.log("Running...");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Application listening on port ${process.env.PORT}!`);
})