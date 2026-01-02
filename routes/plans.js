"use strict";
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const mongoose = require("mongoose");
const { success, successList, failure } = require("../helper/responseHelper.js");
const { JOURNAL_CONSTANTS } = require("../config/constant.js");
const { Plan } = require("../models/plan.js");


router.get("/list", async (req, res) => {

    const criteria = {};

    const skipVal = isNaN(parseInt(req.query.offset)) ? 0 : parseInt(req.query.offset);
    const limitVal = isNaN(parseInt(req.query.limit)) ? 100 : parseInt(req.query.limit);

    if (req.query.type) criteria.type = req.query.type;
    if (req.query.text) {
        const regexText = new RegExp(req.query.text, "i");
        criteria.$or = [{ title: regexText }];
    }

    const list = await Plan.aggregate([
        { $match: criteria },
        { $sort: { insertDate: -1 } },
        {
            $project: {
                _id: 0,
                id: 1,
                version: 1,
                product_id: 1,
                planType: 1,
                name: 1,
                status: 1,
                description: 1,
                usage_type: 1,
                billing_cycles: 1,
                payment_preferences: 1,
                taxes: 1,
                quantity_supported: 1,
                payee: 1,
                create_time: 1,
                update_time: 1,
                links: 1,
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
    let plan = list[0].paginatedDocs;

    return successList(res, req.apiId, JOURNAL_CONSTANTS.LIST_SUCCESS, totalCount, plan);
});



module.exports = router;