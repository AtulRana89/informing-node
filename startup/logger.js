"use strict"

const config = require("config");
const mongoose = require("mongoose");
const { ApiLog } = require("../models/apiLog");

module.exports = function (req, res, next) {

  if (config.get("environment") === "dev") {
    console.log({
      host: req.headers["host"],
      contentType: req.headers["accept"],
      Authorization: req.headers["authorization"],
      userAgent: req.headers["user-agent"],
      method: req.method,
      url: req.url,
      body: req.body
    });
  }

  req.apiId = new mongoose.Types.ObjectId();
  req.startTimeMilli = Math.round(new Date());

  const cleanup = () => {
    res.removeListener("finish", loggerFunction);
    res.removeListener("close", loggerFunction);
    res.removeListener("error", loggerFunction);
  };

  const loggerFunction = async () => {
    cleanup();
    try {
      if (res.req.apiId) {
        let endTimeMilli = new Date();
        let responseTimeMilli = endTimeMilli - req.startTimeMilli;
        const routePath = req.route?.path || "";

        const deviceInfo = {
          deviceName: req.header("x-client-deviceName"),
          deviceId: req.header("x-client-deviceId"),
          deviceOS: req.header("x-client-deviceOS"),
          deviceType: req.header("x-client-deviceType"),
          deviceBuildNumber: req.header("x-client-deviceBuildNumber"),
          userAgent: req.headers["user-agent"],
        };

        await logApis(
          req.apiId,
          req.method,
          req.headers["host"],
          req.reqUserId,
          req.originalUrl,
          req.baseUrl + routePath,
          req.baseUrl,
          req.query,
          req.params,
          req.body,
          req.startTimeMilli,
          endTimeMilli,
          responseTimeMilli,
          res.statusCode,
          res.errorMessage,
          deviceInfo
        );

      }
    } catch (Ex) {
      console.log("Exception in logging: ", Ex);
    }
  };

  res.on("finish", loggerFunction); // SUCCESSful pipeline (regardless of its response)
  res.on("close", loggerFunction); // aborted pipeline
  res.on("error", loggerFunction); // pipeline internal error

  next();
};

async function logApis(apiId, method, host, userId, completeUrl, url, baseUrl, query, params, body, startTimeMilli, endTimeMilli, responseTimeMilli, statusCode, errorMessage, deviceInfo) {
  let apiLog = new ApiLog({
    apiId,
    method,
    userId,
    host,
    completeUrl,
    url,
    baseUrl,
    query,
    params,
    body,
    deviceInfo,
    startTimeMilli,
    endTimeMilli,
    responseTimeMilli,
    statusCode,
    errorMessage,
  });
  await apiLog.save();

  if (apiLog.statusCode >= 500) {
    // await sendTelegramMessage(apiLog);
  }
}


