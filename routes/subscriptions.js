"use strict"
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { success, failure, successList } = require("../helper/responseHelper.js")
const { createPayPalSubscription, cancelSubscription } = require("../services/paypal.js");
const { Subscription } = require("../models/subscription.js");

// const { sendFcmNotification } = require("../services/fcmModule.js");

router.post("/paypal/webhook", async (req, res) => {
    try {
        const webhookEvent = JSON.parse(req.body.toString());

        console.log("🔔 PAYPAL WEBHOOK RECEIVED :", webhookEvent);
        console.log("Event Type:", webhookEvent.event_type);
        console.log("Event ID:", webhookEvent.id);
        console.log("Resource:", webhookEvent.resource);

        // Example: handle successful payment
        if (webhookEvent.event_type === "PAYMENT.CAPTURE.COMPLETED") {
            console.log("✅ Payment completed");
            console.log("Amount:", webhookEvent.resource.amount.value);
            console.log("Currency:", webhookEvent.resource.amount.currency_code);
        }

        return res.sendStatus(200);
    } catch (error) {
        console.error('Create subscription error:', error);
        return failure(res, req.apiId, error.message || 'Failed to create subscription');
    }
});

module.exports = router;

