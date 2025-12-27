"use strict"

const express = require("express");
const Logger = require("../startup/logger");
const error = require("../middleware/error");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require('../swagger_output.json');

const admin = require("../routes/admins");
const dashboard = require("../routes/dashboard");
const user = require("../routes/users");
const mediaUpload = require("../routes/mediaUpload");
const banners = require("../routes/banners");
const journals = require("../routes/journals");
const topic = require("../routes/topics");
const conferences = require("../routes/conferences");
const faq = require("../routes/faq");
const content = require("../routes/contentManagements");
const webview = require("../routes/webviews");
const plans = require("../routes/plans");
const languageMiddleware = require("../middleware/language");



module.exports = async function (app) {

  app.use(express.json());
  app.use(languageMiddleware)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use(Logger);
  app.use("/api/admin", admin);
  app.use("/api/dashboard", dashboard);
  app.use("/api/user", user);
  app.use("/api/mediaUpload", mediaUpload);
  app.use("/api/banners", banners);
  app.use("/api/journal", journals);
  app.use("/api/topic", topic);
  app.use("/api/conference", conferences);
  app.use("/api/faq", faq);
  app.use("/api/content", content);
  app.use("/api/webviews", webview);
  app.use("/api/plan", plans);
  app.use(error);
};