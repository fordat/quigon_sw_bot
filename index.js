import blue from "@atproto/api";
import fs from "node:fs";
import dotenv from "dotenv";

dotenv.config();

const { BskyAgent } = blue;

const BLUESKY_BOT_USERNAME = process.env.APP_USERNAME
const BLUESKY_BOT_PASSWORD = process.env.APP_PASSWORD

const fileName = "./quotes.json";

const generateQuiGonQuote = async () => {
  const file = fs.readFileSync(fileName);
  const fileContent = JSON.parse(file);
  console.log(fileContent);

  // quote received

  const { RichText } = blue;
  const agent = new BskyAgent({ service: "https://bsky.social/"});
  await agent.login({
    identifier: BLUESKY_BOT_USERNAME,
    password: BLUESKY_BOT_PASSWORD,
  });

  const rt = new RichText({ text: fileContent.body[1] });
  const postRecord = {
    $type: "app.bsky.feed.post",
    text: rt.text,
    facets: rt.facets,
    createdAt: new Date().toISOString(),
  };
  await agent.post(postRecord);
};

generateQuiGonQuote();