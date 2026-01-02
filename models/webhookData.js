"use strict";
const mongoose = require("mongoose");

const webhookDataSchema = new mongoose.Schema({
    data: { type: Object },
    insertDate: { type: Number, default: () => { return Math.round(new Date() / 1000) } },
    updatedDate: { type: Number, default: () => Math.round(Date.now() / 1000) },
});

const WebhookData = mongoose.model("WebhookData", webhookDataSchema);
module.exports = { WebhookData };
