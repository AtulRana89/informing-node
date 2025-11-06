"use strict";
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  personalTitle: {
    type: String,
    enum: ["Mr", "Ms", "Dr", "Prof", ""],
    default: ""
  },
  personalName: { type: String },
  middleInitial: { type: String, default: "" },
  familyName: { type: String },
  email: { type: String },
  primaryTelephone: { type: String },
  secondaryTelephone: { type: String, default: "" },
  address: { type: String, default: "" },
  city: { type: String },
  stateProvince: { type: String, default: "" },
  postalCode: { type: String, default: "" },
  country: { type: String },
  affiliationUniversity: { type: String },
  department: { type: String, default: "" },
  password: { type: String },
  accessToken: { type: String },
  profilePic: { type: String, default: "" },
  gender: { type: String, enum: ["female", "male", "other"] },
  isNotification: { type: Boolean, default: true },
  role: {
    type: String,
    enum: ["user", "eic", "admin"],
    default: "user"
  },
  status: { type: String, enum: ["active", "inactive", "deleted"], default: "active" },
  deletedEmail: { type: String },
  deletedMobile: { type: String },
  deletedPersonalName: { type: String },
  deletedFamilyName: { type: String },
  insertDate: { type: Number, default: () => { return Math.round(new Date() / 1000) } },
  updatedDate: { type: Number, default: () => Math.round(Date.now() / 1000) },
});

userSchema.index({ email: 1 }, { unique: false });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

const User = mongoose.model("User", userSchema);

module.exports = {
  User
};