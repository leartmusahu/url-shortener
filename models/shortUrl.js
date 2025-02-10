const mongoose = require("mongoose");
const shortId = require("shortid"); //librari qe krijon nje id unik

const shortUrlSchema = new mongoose.Schema({
  full: {
    type: String,
    required: true,
  },
  short: {
    type: String,
    required: true,
    default: shortId.generate,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("ShortUrl", shortUrlSchema);
