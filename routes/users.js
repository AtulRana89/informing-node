"use strict"
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { success, failure, successList } = require("../helper/responseHelper.js")
const { identityManager } = require("../middleware/auth.js");
// const { verifyAndDeleteToken, verifyAndDeleteTokenEmail } = require("../validations/otp.js");
const { generateAuthToken } = require("../services/jwtToken.js");
const { generateHash, compareHash } = require("../services/bcrypt.js");
const { OTP_CONSTANTS, USER_CONSTANTS, AUTH_CONSTANTS } = require("../config/constant.js");
const { validateUserRegister, validateUserEdit, validateUserLogin, validateForgotResetPasswordEmail, validateChangePassword } = require("../validations/user.js");
const { User } = require("../models/user.js");
// const { Notification } = require("../models/notification.js");

// const { sendFcmNotification } = require("../services/fcmModule.js");

router.post("/", async (req, res) => {
  const { error } = validateUserRegister(req.body);
  if (error) return failure(res, req.apiId, error.details[0].message);

  const email = req.body.email.toLowerCase();

  if (email) {
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) return failure(res, req.apiId, USER_CONSTANTS.EMAIL_ALREADY_EXISTS);
  }

  let user = new User({
    personalName: req.body.personalName,
    middleInitial: req.body.middleInitial,
    familyName: req.body.familyName,
    city: req.body.city,
    country: req.body.country,
    affiliationUniversity: req.body.affiliationUniversity,
    department: req.body.department,
    email: req.body.email,
    password: req.body.password,
    status: "active",
    role: req.body.role
  });

  const token = generateAuthToken(user._id, email, user.role);
  user.accessToken = token;

  await user.save();

  const response = {
    _id: user._id,
    role: user.role,
    email: user.email,
  };

  return success(res.header("Authorization", token), req.apiId, USER_CONSTANTS.USER_CREATED_SUCCESS, response);
});

router.post("/login", async (req, res) => {
  const { error } = validateUserLogin(req.body);
  if (error) return failure(res, req.apiId, error.details[0].message);

  let email;
  if (req.body.email) email = req.body.email.toLowerCase();

  let user = await User.findOne({ email: email, status: "active" });
  if (!user) return failure(res, req.apiId, AUTH_CONSTANTS.INVALID_CREDENTIALS);

  const validPassword = compareHash(req.body.password, user.password);
  if (!validPassword) return failure(res, req.apiId, AUTH_CONSTANTS.INVALID_PASSWORD);

  const token = generateAuthToken(user._id, user.email, user.role);
  user.accessToken = token;

  await user.save();

  user.userId = user.userId = user._id.toString();
  user.status = "active";

  const response = _.pick(user, [
    "userId",
    "personalName",
    "middleInitial",
    "familyName",
    "city",
    "country",
    "affiliationUniversity",
    "department",
    "email",
    "status",
    "role"
  ]);

  return success(res.header("Authorization", token), req.apiId, USER_CONSTANTS.LOGIN_SUCCESS, response);
});

router.put("/update", identityManager(["user", "admin", "superAdmin"]), async (req, res) => {
  const { error } = validateUserEdit(req.body);
  if (error) return failure(res, req.apiId, error.details[0].message);

  let userId;
  if (req.jwtData.role === "superAdmin") {
    userId = req.jwtData.userId;
  } else {
    if (!req.body.userId) return failure(res, req.apiId, USER_CONSTANTS.USERID_REQUIRED);
    userId = req.body.userId
  }

  let user = await User.findById(userId);
  if (!user) return failure(res, req.apiId, AUTH_CONSTANTS.INVALID_USER);

  user.role = req.body.role || user.role;
  user.personalName = req.body.personalName || user.personalName;
  user.middleInitial = req.body.middleInitial || user.middleInitial;
  user.familyName = req.body.familyName || user.familyName;
  user.gender = req.body.gender || user.gender;
  user.profilePic = req.body.profilePic || user.profilePic;
  user.primaryTelephone = req.body.primaryTelephone || user.primaryTelephone;
  user.secondaryTelephone = req.body.secondaryTelephone || user.secondaryTelephone;
  user.address = req.body.address || user.address;
  user.city = req.body.city || user.city;
  user.stateProvince = req.body.stateProvince || user.stateProvince;
  user.postalCode = req.body.postalCode || user.postalCode;
  user.country = req.body.country || user.country;
  user.countryCode = req.body.countryCode || user.countryCode;
  user.affiliationUniversity = req.body.affiliationUniversity || user.affiliationUniversity;
  user.department = req.body.department || user.department;
  user.positionTitle = req.body.positionTitle || user.positionTitle;
  user.orcid = req.body.orcid || user.orcid;
  user.resume = req.body.resume || user.resume;
  user.bio = req.body.bio || user.bio;
  user.note = req.body.note || user.note;
  user.websiteUrl = req.body.websiteUrl || user.websiteUrl;
  if (req.body.socialMedia) {
    user.socialMedia.twitter = req.body.socialMedia.twitter || user.socialMedia.twitter;
    user.socialMedia.facebook = req.body.socialMedia.facebook || user.socialMedia.facebook;
    user.socialMedia.googlePlus = req.body.socialMedia.googlePlus || user.socialMedia.googlePlus;
    user.socialMedia.linkedin = req.body.socialMedia.linkedin || user.socialMedia.linkedin;
  }
  user.receiveSecondaryEmail = req.body.receiveSecondaryEmail || user.receiveSecondaryEmail;
  user.isiPositions = req.body.isiPositions || user.isiPositions;
  if (req.body.hasOwnProperty("isReviewerEditorOfMonth")) {
    user.isReviewerEditorOfMonth = req.body.isReviewerEditorOfMonth;
  }
  if (req.body.ofTheMonth) {
    user.ofTheMonth.type = req.body.ofTheMonth.type || user.ofTheMonth.type;
    user.ofTheMonth.month = req.body.ofTheMonth.month || user.ofTheMonth.month;
    user.ofTheMonth.year = req.body.ofTheMonth.year || user.ofTheMonth.year;
  }
  user.testimonial = req.body.testimonial || user.testimonial;
  user.memberUntil = req.body.memberUntil || user.memberUntil;
  user.membershipTypes = req.body.membershipTypes || user.membershipTypes;
  if (req.body.status) {
    if (req.body.status != "active") {
      user.accessToken = "";
    }
    user.status = req.body.status || user.status;
  }


  await user.save();
  user.userId = user._id.toString();

  let response = _.pick(user, [
    "role",
    "personalName",
    "middleInitial",
    "familyName",
    "gender",
    "profilePic",
    "primaryTelephone",
    "secondaryTelephone",
    "address",
    "city",
    "stateProvince",
    "postalCode",
    "country",
    "countryCode",
    "affiliationUniversity",
    "department",
    "positionTitle",
    "orcid",
    "resume",
    "bio",
    "note",
    "websiteUrl",
    "receiveSecondaryEmail",
    "isiPositions",
    "status",
    "insertDate",
  ]);

  return success(res, req.apiId, USER_CONSTANTS.EDIT_PROFILE_SUCCESS, response)
});

router.get("/profile", identityManager(["user", "superAdmin"]), async (req, res) => {
  let userId;
  if (req.query.userId) {
    userId = req.query.userId;
  } else {
    userId = req.jwtData.userId;
  }
  const response = await User.findById(
    userId,
    {
      personalTitle: 1,
      personalName: 1,
      middleInitial: 1,
      familyName: 1,
      gender: 1,
      profilePic: 1,
      primaryTelephone: 1,
      secondaryTelephone: 1,
      address: 1,
      city: 1,
      stateProvince: 1,
      postalCode: 1,
      country: 1,
      countryCode: 1,
      affiliationUniversity: 1,
      department: 1,
      positionTitle: 1,
      orcid: 1,
      resume: 1,
      bio: 1,
      note: 1,
      websiteUrl: 1,
      receiveSecondaryEmail: 1,
      isiPositions: 1,
      status: 1,
      insertDate: 1,
    }
  ).lean();

  if (response) {
    response.userId = response._id;
    delete response._id;
  }

  return success(res, req.apiId, USER_CONSTANTS.VIEW_PROFILE_SUCCESS, response);
});

router.get("/list", identityManager(["admin", "superAdmin"]), async (req, res) => {
  try {
    let criteria = {};
    criteria.status = { $ne: "deleted" }

    const skipVal = isNaN(parseInt(req.query.offset)) ? 0 : parseInt(req.query.offset);
    const limitVal = isNaN(parseInt(req.query.limit)) ? 100 : parseInt(req.query.limit);

    if (req.query.userId) {
      criteria._id = new mongoose.Types.ObjectId(req.query.userId);
    }

    if (req.query.text) {
      var regexName = new RegExp(req.query.text, "i");
      criteria.$or = [{ firstName: regexName }, { lastName: regexName }, { email: regexName }, { userName: regexName }];
    }

    if (req.query.status) criteria.status = req.query.status;

    const list = await User.aggregate([
      { $match: criteria },
      { $sort: { insertDate: -1 } },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          personalTitle: 1,
          personalName: 1,
          middleInitial: 1,
          familyName: 1,
          gender: 1,
          profilePic: 1,
          primaryTelephone: 1,
          secondaryTelephone: 1,
          address: 1,
          city: 1,
          stateProvince: 1,
          postalCode: 1,
          country: 1,
          countryCode: 1,
          affiliationUniversity: 1,
          department: 1,
          positionTitle: 1,
          orcid: 1,
          resume: 1,
          bio: 1,
          note: 1,
          websiteUrl: 1,
          email: 1,
          receiveSecondaryEmail: 1,
          isiPositions: 1,
          status: 1,
          insertDate: 1,
        }
      },
      {
        $facet: {
          allDocs: [{ $group: { _id: null, totalCount: { $sum: 1 } } }],
          paginatedDocs: [{ $skip: skipVal }, { $limit: limitVal }],
        }
      }
    ]);

    let totalCount = list[0].allDocs.length > 0 ? list[0].allDocs[0].totalCount : 0;
    let users = list[0].paginatedDocs;

    return successList(res, req.apiId, USER_CONSTANTS.USER_LIST_SUCCESS, totalCount, users)

  } catch (error) {
    console.error("USER LIST ERROR:", error.message);
    return internalError(res, req.apiId, error.message || SYSTEM_CONSTANTS.INTERNAL_SERVER_ERROR);
  }
});

router.post("/forgot/password", async (req, res) => {
  const { error } = validateForgotResetPasswordEmail(req.body);
  if (error) return failure(res, req.apiId, error.details[0].message);

  const email = req.body.email.toLowerCase();
  const user = await User.findOne({ email: email });
  if (!user) return failure(res, req.apiId, USER_CONSTANTS.USER_NOT_FOUND);

  // const isValid = await verifyAndDeleteToken(email, req.body.otpToken, "UFP");
  // if (!isValid) return failure(res, req.apiId, OTP_CONSTANTS.INVALID_OTP);

  var encryptPassword = generateHash(req.body.newPassword);
  user.password = encryptPassword;
  await user.save();

  return success(res, req.apiId, USER_CONSTANTS.PASSWORD_RESET_SUCCESS)
});

router.post("/change/password", identityManager(["user"]), async (req, res) => {
  const { error } = validateChangePassword(req.body);
  if (error) return failure(res, req.apiId, error.details[0].message);

  const user = await User.findById(req.jwtData.userId);
  if (!user) return failure(res, req.apiId, USER_CONSTANTS.NOT_FOUND);

  const validPassword = compareHash(req.body.oldPassword, user.password);
  if (!validPassword) return failure(res, req.apiId, USER_CONSTANTS.INVALID_OLD_PASSWORD);

  let encryptPassword = generateHash(req.body.newPassword);
  user.password = encryptPassword;
  await user.save();

  return success(res, req.apiId, USER_CONSTANTS.PASSWORD_CHANGE_SUCCESS)
});

router.post("/logout", identityManager(["user"]), async (req, res) => {
  let userId;
  if (req.jwtData.role === "user") {
    userId = req.jwtData.userId;
  }

  let user = await User.findById(userId);
  if (!user) return failure(res, req.apiId, AUTH_CONSTANTS.INVALID_USER);

  user.accessToken = "";
  user.deviceToken = "";
  await user.save();

  return success(res, req.apiId, USER_CONSTANTS.LOGOUT_SUCCESS);
});

router.delete("/:id", identityManager(["admin", "user", "superAdmin"]), async (req, res) => {
  const userId = req.jwtData.role === "admin" ? req.params.id : req.jwtData.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) return failure(res, req.apiId, USER_CONSTANTS.INVALID_ID);

  const user = await User.findById(userId);
  if (!user) return failure(res, req.apiId, USER_CONSTANTS.NOT_FOUND);

  await user.deleteOne({ _id: user._id });

  return success(res, req.apiId, USER_CONSTANTS.DELETED_SUCCESSFULLY);
});

module.exports = router;

