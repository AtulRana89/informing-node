const { translateData } = require("./google-translate");

const success = async (res, apiId, message, data, statusCode) => {
  const language = res.req.language || "en";
  let translatedMessage =
    typeof message === "object" ? message[language] : message;

  // Translate the data field to include display object
  const translatedData = await translateData(data, language);

  let response = {
    apiId: apiId,
    message: "Success",
    status: statusCode || 200,
    data: {
      message: translatedMessage,
      response: translatedData || {},
    },
  };
  return res.status(response.status).send(response);
};

const successList = async (res, apiId, message, count, data, statusCode, unreadCount) => {
  const language = res.req.language || "en";
  let translatedMessage =
    typeof message === "object" ? message[language] : message;

  // Translate the data (list) field to include display object
  const translatedData = await translateData(data, language);

  let response = {
    apiId: apiId,
    message: "Success",
    status: statusCode || 200,
    data: {
      message: translatedMessage,
      totalCount: count || 0,
      list: translatedData || [],
    },
  };
  if (unreadCount) {
    response.data.unreadCount = unreadCount
  }
  return res.status(response.status).send(response);
};

const failure = async (res, apiId, message, data, statusCode) => {
  const language = res.req.language || "en";
  let translatedMessage =
    typeof message === "object" ? message[language] : message;

  // Translate the data field to include display object
  const translatedData = await translateData(data, language);

  let response = {
    apiId: apiId,
    message: "Failure",
    status: statusCode || 400,
    data: {
      message: translatedMessage,
      response: translatedData || {},
    },
  };
  res.errorMessage = translatedMessage;
  return res.status(response.status).send(response);
};

const internalError = async (res, apiId, message, data) => {
  const language = res.req.language || "en";
  let translatedMessage =
    typeof message === "object" ? message[language] : message;

  // Translate the data field to include display object
  const translatedData = await translateData(data, language);

  let response = {
    apiId: apiId,
    message: "Failure",
    status: 500,
    data: {
      message: translatedMessage,
      response: translatedData || {},
    },
  };
  res.errorMessage = translatedMessage;
  return res.status(response.status).send(response);
};

module.exports = {
  success,
  successList,
  failure,
  internalError,
};