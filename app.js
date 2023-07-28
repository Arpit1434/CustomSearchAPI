const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const { ScrapingBeeClient } = require("scrapingbee");

dotenv.config();

const app = express();

const googleAPIKey = process.env.GOOGLE_API_KEY;
const searchEngineID = process.env.SEARCH_ENGINE_ID;

const apiKey = process.env.SCRAPING_BEE_API_KEY;
const client = new ScrapingBeeClient(apiKey);

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/public/views"));

app.listen(5000);

app.get("/", (req, res) => {
  res.render("index", { googleAPIKey, searchEngineID });
});

async function scrapeUrl(url) {
  try {
    const response = await client.get({
      url: url,
      params: { extract_rules: { text: "body" } },
    });
    const text = response.data.toString("utf-8");
    return text;
  } catch (error) {
    console.error("Error:", error.message);
    throw new Error("An error occurred while scraping the URL");
  }
}

app.get("/scrape", (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('Missing "url" parameter');
  }

  scrapeUrl(url)
    .then((scrapedText) => {
      res.send(scrapedText);
    })
    .catch((error) => {
      console.error("Error:", error.message);
      res.status(500).send("An error occurred while scraping the URL");
    });
});

app.use((req, res) => {
  res.redirect("/");
});
