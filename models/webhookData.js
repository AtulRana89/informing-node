const mongoose = require("mongoose");

const webhookDataSchema = new mongoose.Schema({
    data: { type: Object },
});

const WebhookData = mongoose.model("webhookData", webhookDataSchema);
module.exports = { WebhookData };