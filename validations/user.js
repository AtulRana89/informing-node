"use strict";

const Joi = require("joi");
const { valMsgFormatter } = require("../services/commonFunctions.js");

function validateUserRegister(req) {
  const schema = Joi.object({
    personalName: Joi.string().required(),
    middleInitial: Joi.string().allow(""),
    familyName: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    email: Joi.string().required(),
    affiliationUniversity: Joi.string().required(),
    department: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().valid("user", "eic", "admin").required(),
  });

  const result = schema.validate(req);
  if (result.error) {
    result.error.details[0].message = valMsgFormatter(result.error.details[0].message);
  }
  return result;
}

function validateUserLogin(req) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    deviceToken: Joi.string().optional().allow("")
  });
  const result = schema.validate(req);
  if (result.error) {
    result.error.details[0].message = valMsgFormatter(result.error.details[0].message);
  }
  return result;
}

function validateUserEdit(req) {
  const schema = Joi.object({
    userId: Joi.string(),
    profilePic: Joi.string().allow(""),
    email: Joi.string().allow(""),
    firstName: Joi.string().min(1).max(20),
    lastName: Joi.string().min(1).max(50),
    countryCode: Joi.string().optional().allow(""),
    isNotification: Joi.boolean(),
    mobile: Joi.string().optional().allow(""),
    status: Joi.string().valid("active", "inactive"),
    deviceToken: Joi.string().allow("").optional(),
    countryCode: Joi.string().when("mobile", {
      is: Joi.exist(),
      then: Joi.string().allow(""),
      otherwise: Joi.optional().allow(""),
    }),
    otpToken: Joi.number().optional().allow(""),
  });
  const result = schema.validate(req);
  if (result.error) {
    result.error.details[0].message = valMsgFormatter(result.error.details[0].message);
  }
  return result;
}

function validateForgotResetPasswordEmail(req) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otpToken: Joi.number().integer().required(),
    newPassword: Joi.string().min(10).max(250).pattern(/^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{10,}$/).required().messages({ 'string.pattern.base': 'Password must be at least 10 characters and include at least one special character' }),
    confirmPassword: Joi.any().equal(Joi.ref('newPassword')).required()
      .label('Confirm password')
      .options({ messages: { 'any.only': '{{#label}} does not match' } }),
  });

  const result = schema.validate(req);
  if (result.error) {
    result.error.details[0].message = valMsgFormatter(result.error.details[0].message);
  }
  return result;
}

function validateChangePassword(req) {
  const schema = Joi.object({
    oldPassword: Joi.string().min(10).required(),
    newPassword: Joi.string().min(10).max(250).pattern(/^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{10,}$/).required().messages({ 'string.pattern.base': 'Password must be at least 10 characters and include at least one special character' }),
  });
  const result = schema.validate(req);
  if (result.error) {
    result.error.details[0].message = valMsgFormatter(result.error.details[0].message);
  }
  return result;
}

module.exports = {
  validateUserRegister,
  validateUserEdit,
  validateUserLogin,
  validateForgotResetPasswordEmail,
  validateChangePassword
};