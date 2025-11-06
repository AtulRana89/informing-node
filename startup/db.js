"use strict"

const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");

const logConfiguration = {
  'transports': [
    new winston.transports.Console()
  ]
};
const logger = winston.createLogger(logConfiguration);

module.exports = async function () {
  try {
    let db = config.get("dbLink");
    await mongoose.connect(db).then(() => console.log(`Connected to the database : ${db}`));
  } catch (err) {
    console.log(err.message, "Could not connect to the database");
  }
}


