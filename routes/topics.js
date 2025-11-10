"use strict";
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const mongoose = require("mongoose");
const { success, successList, failure } = require("../helper/responseHelper.js");
const { identityManager } = require("../middleware/auth.js");
const { TOPIC_CONSTANTS } = require("../config/constant.js");
const { Topic, SubTopic } = require("../models/topic.js");
const { validateTopicCreate, validateTopicUpdate, validateTopicList, validateSubTopicCreate, validateSubTopicUpdate, validateSubTopicList } = require("../validations/topic.js");

router.post("/", identityManager(["superAdmin"]), async (req, res) => {
    const { error } = validateTopicCreate(req.body);
    if (error) return failure(res, req.apiId, error.details[0].message);

    const newTopic = new Topic({
        name: req.body.name,

    });

    await newTopic.save();

    const response = _.pick(newTopic.toObject(), [
        "_id",
        "name",
        "insertDate"
    ]);

    return success(res, req.apiId, TOPIC_CONSTANTS.CREATE_SUCCESS, response);
});

router.put("/", identityManager(["superAdmin"]), async (req, res) => {
    const { error } = validateTopicUpdate(req.body);
    if (error) return failure(res, req.apiId, error.details[0].message);

    const topicId = req.body.topicId;
    if (!mongoose.Types.ObjectId.isValid(topicId)) return failure(res, req.apiId, TOPIC_CONSTANTS.INVALID_TOPIC_ID);

    const topic = await Topic.findById(topicId);
    if (!topic) return failure(res, req.apiId, TOPIC_CONSTANTS.NOT_FOUND);

    if (req.body.name) topic.title = req.body.title;

    await topic.save();

    const response = _.pick(topic.toObject(), [
        "_id",
        "name",
        "insertDate",
        "updatedDate"
    ]);

    return success(res, req.apiId, TOPIC_CONSTANTS.UPDATE_SUCCESS, response);
});

router.delete("/:id", identityManager(["superAdmin"]), async (req, res) => {
    const topicId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(topicId)) return failure(res, req.apiId, TOPIC_CONSTANTS.INVALID_TOPIC_ID);

    const topic = await Topic.findById(topicId);
    if (!topic) return failure(res, req.apiId, TOPIC_CONSTANTS.NOT_FOUND);

    await topic.deleteOne({ _id: topic._id });

    return success(res, req.apiId, TOPIC_CONSTANTS.DELETE_SUCCESS);
});

router.get("/list", identityManager(["user", "superAdmin", "admin"]), async (req, res) => {
    const { error } = validateTopicList(req.query);
    if (error) return failure(res, req.apiId, error.details[0].message);

    const criteria = {};

    const skipVal = isNaN(parseInt(req.query.offset)) ? 0 : parseInt(req.query.offset);
    const limitVal = isNaN(parseInt(req.query.limit)) ? 100 : parseInt(req.query.limit);

    if (req.query.topicId) criteria._id = new mongoose.Types.ObjectId(req.query.topicId);
    if (req.query.type) criteria.type = req.query.type;
    if (req.query.text) {
        const regexText = new RegExp(req.query.text, "i");
        criteria.$or = [{ title: regexText }];
    }

    const list = await Topic.aggregate([
        { $match: criteria },
        { $sort: { insertDate: -1 } },
        {
            $project: {
                _id: 0,
                topicId: "$_id",
                name: 1,
                insertDate: 1,
                updateDate: 1
            }
        },
        {
            $facet: {
                allDocs: [{ $group: { _id: null, totalCount: { $sum: 1 } } }],
                paginatedDocs: [{ $skip: skipVal }, { $limit: limitVal }]
            }
        }
    ]);

    let totalCount = list[0].allDocs.length > 0 ? list[0].allDocs[0].totalCount : 0;
    let topic = list[0].paginatedDocs;

    return successList(res, req.apiId, TOPIC_CONSTANTS.LIST_SUCCESS, totalCount, topic);
});

// sub topic
router.post("/sub", identityManager(["superAdmin"]), async (req, res) => {
    const { error } = validateSubTopicCreate(req.body);
    if (error) return failure(res, req.apiId, error.details[0].message);
    const topicId = req.body.topicId;
    const topic = await Topic.findById(topicId);
    if (!topic) return failure(res, req.apiId, TOPIC_CONSTANTS.NOT_FOUND);

    const newSubTopic = new SubTopic({
        name: req.body.name,
        minSelections: req.body.minSelections,
        maxSelections: req.body.maxSelections,
        topicId: topicId
    });

    await newSubTopic.save();

    const response = _.pick(newSubTopic.toObject(), [
        "_id",
        "name",
        "minSelections",
        "maxSelections",
        "insertDate"
    ]);

    return success(res, req.apiId, TOPIC_CONSTANTS.CREATE_SUCCESS, response);
});

router.put("/", identityManager(["superAdmin"]), async (req, res) => {
    const { error } = validateSubTopicUpdate(req.body);
    if (error) return failure(res, req.apiId, error.details[0].message);

    const subTopicId = req.body.subTopicId;
    const subTopic = await SubTopic.findById(subTopicId);
    if (!subTopic) return failure(res, req.apiId, TOPIC_CONSTANTS.NOT_FOUND);

    if (req.body.name) subTopic.title = req.body.title;

    await subTopic.save();

    const response = _.pick(topic.toObject(), [
        "_id",
        "name",
        "insertDate",
        "updatedDate"
    ]);

    return success(res, req.apiId, TOPIC_CONSTANTS.UPDATE_SUCCESS, response);
});
module.exports = router;