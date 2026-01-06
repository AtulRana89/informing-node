"use strict";

const mongoose = require("mongoose");

// otp schema
const otpSchema = new mongoose.Schema({
    email: String,
    mobile: String,
    countryCode: { type: String },
    otp: { type: Number, min: 1000, max: 9999 },
    status: { type: Boolean, default: true },
    type: { type: String, enum: ["AU", "AFP", "UR", "UU", "UFP", "UL"] },
    verifyCount: { type: Number, default: 0 },
    otpExpiry: { type: Date, default: () => { return new Date() } },
    creationDate: { type: Date, default: () => { return new Date() } },
    insertDate: { type: Date, default: () => { return new Date() } }
});

// generate a new otp
otpSchema.methods.generateOtp = function () {
    const otp = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
    return otp;
};

const Otp = mongoose.model("Otp", otpSchema);

// otp Token schema
const otpTokenSchema = new mongoose.Schema({
    email: { type: String, minlength: 5 },
    countryCode: { type: String },
    token: Number,
    mobile: String,
    type: { type: String, enum: ["AU", "AFP", "UR", "UU", "UFP", "UL"] },
    insertDate: { type: Date, default: () => { return new Date() } },
    creationDate: { type: Date, default: () => { return new Date() } },
});

otpTokenSchema.index({ insertDate: 1 }, { expireAfterSeconds: 600 });

// generate otp token
otpTokenSchema.methods.generateToken = function () {
    const token = Math.floor(Math.random() * (9999999 - 1000000 + 1) + 1000000);
    return token;
};

const OtpToken = mongoose.model("OtpToken", otpTokenSchema);

module.exports = {
    Otp,
    OtpToken
};