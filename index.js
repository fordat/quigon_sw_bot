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

const fileName = "./data/quotes.json";
const countFileName  = "./data/count.json";

const file = fs.readFileSync(fileName);
const fileContent = JSON.parse(file);

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

const readAndIncrementCountFromJson = () => {
  let countFile = fs.readFileSync(countFileName);
  let countFileContent = JSON.parse(countFile);
  let count = countFileContent.count;

  console.log("quote file length: ", fileContent.body.length);

  let incrementedCount = count + 1 > fileContent.body.length - 1 ? 0 : count + 1;

  console.log("reading count: ", count);

  let newCountFileContent = {
    count: incrementedCount
  }

  let data = JSON.stringify(newCountFileContent);

  fs.writeFileSync("./data/count.json", data);

  return count;
}

const generateQuiGonQuote = () => {
  let selectedInt = readAndIncrementCountFromJson();
  console.log("selected quote interval: ", selectedInt);
  console.log("randomly selected quote: ", fileContent.body[selectedInt]);

  let selectedQuoteObject = fileContent.body[selectedInt];

  // quote received
  postToBluesky(selectedQuoteObject["english"]);

  // japanese for two hours later
  setTimeout(() => {
    postToBluesky(selectedQuoteObject["japanese"]);
  }, 7200000);
};

cron.schedule('*/5 * * * *', () => {
  console.log("Pinging to stay awake...")
  axios.get('https://quigon-sw-bot-bf4f7e27a12b.herokuapp.com/');
})

cron.schedule('0 */4 * * *', () => {
  generateQuiGonQuote();
});

cron.schedule('*/5 * * * * *', () => {
  console.log("Running...");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Application listening on port ${process.env.PORT}!`);
})