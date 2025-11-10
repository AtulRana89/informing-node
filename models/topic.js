"use strict";
const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
    name: { type: String },
    insertDate: { type: Number, default: () => { return Math.round(new Date() / 1000) } },
    updatedDate: { type: Number, default: () => Math.round(Date.now() / 1000) },
});

const Topic = mongoose.model("Topic", topicSchema);

module.exports = { Topic };

const subTopicSchema = new mongoose.Schema({
    name: { type: String },
    minSelections: { type: String },
    maxSelections: { type: String },
    topicId: { type: String },
    insertDate: { type: Number, default: () => { return Math.round(new Date() / 1000) } },
    updatedDate: { type: Number, default: () => Math.round(Date.now() / 1000) },
});

const SubTopic = mongoose.model("SubTopic", subTopicSchema);

module.exports = { SubTopic };