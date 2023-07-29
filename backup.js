const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
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

  // japanese for two hours later
  setTimeout(() => {
    postToBluesky(randomQuoteObject["japanese"]);
  }, 7200000);
};