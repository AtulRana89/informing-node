"use strict";
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    userId: { type: String },
    planId: { type: String, required: true },
    planType: { type: String, enum: ["FREE_ASSOCIATE", "BASIC", "SPONSORING"], required: true },
    duration: { type: String, enum: ["1_YEAR", "5_YEAR", "LIFE", "ASSOCIATE"] },
    startDate: { type: Number },
    endDate: { type: Number },
    status: { type: String, enum: ["ACTIVE", "EXPIRED", "CANCELLED", "PENDING"], default: "PENDING" },
    paymentStatus: { type: String, enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED", "FREE"], default: "PENDING" },
    transactionId: { type: String },
    amount: { type: String },
    paypalOrderId: { type: String },
    paypalSubscriptionId: { type: String },
    autoRenew: { type: Boolean, default: false },
    insertDate: { type: Number, default: () => { return Math.round(new Date() / 1000) } },
    updatedDate: { type: Number, default: () => Math.round(Date.now() / 1000) },
});


const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = { Subscription };