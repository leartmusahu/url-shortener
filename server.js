const express = require("express");
const mongoose = require("mongoose");
const app = express();
const ShortUrl = require("./models/shortUrl");

mongoose
  .connect("mongodb://localhost/urlShortener")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Could not connect to MongoDB:", error));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("assets"));

app.get("/", async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render("index", { shortUrls: shortUrls });
});

app.post("/shortUrls", async (req, res) => {
  let expirationDate = null;
  if (req.body.expiration) {
    const expirationValue = req.body.expiration;
    const now = new Date();

    if (expirationValue === "1m") {
      expirationDate = new Date(now.getTime() + 1 * 60000);
    } else if (expirationValue === "5m") {
      expirationDate = new Date(now.getTime() + 5 * 60000);
    } else if (expirationValue === "30m") {
      expirationDate = new Date(now.getTime() + 30 * 60000);
    } else if (expirationValue === "1h") {
      expirationDate = new Date(now.getTime() + 60 * 60000);
    } else if (expirationValue === "5h") {
      expirationDate = new Date(now.getTime() + 5 * 60 * 60000);
    }
  }

  await ShortUrl.create({
    full: req.body.fullUrl,
    expiresAt: expirationDate,
  });

  res.redirect("/");
});

app.get("/:shortUrl", async (req, res) => {
  const shortUrl = await ShortUrl.findOne({
    short: req.params.shortUrl,
  });
  if (shortUrl == null) return res.sendStatus(404);

  if (shortUrl.expiresAt && new Date(shortUrl.expiresAt) < new Date()) {
    return res.sendStatus(404);
  }

  shortUrl.save();

  res.redirect(shortUrl.full);
});

app.post("/shortUrls/:id/delete", async (req, res) => {
  try {
    await ShortUrl.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting URL:", error);
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 5000);
