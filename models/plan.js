"use strict";
const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    planType: String,
    type: { type: String, enum: ["BASIC", "SPONSORING"], required: true },
    version: Number,
    product_id: String,
    name: String,
    status: { type: String, },
    description: String,
    usage_type: String,
    billing_cycles: { type: Array, },
    payment_preferences: { type: Object },
    taxes: { type: Object },
    quantity_supported: Boolean,
    payee: { type: Object },
    create_time: Date,
    update_time: Date,
    links: { type: Array, },
    insertDate: { type: Number, default: () => { return Math.round(new Date() / 1000) } },
    updatedDate: { type: Number, default: () => Math.round(Date.now() / 1000) },
});


const Plan = mongoose.model("Plan", planSchema);

module.exports = { Plan };