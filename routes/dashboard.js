"use strict"
const express = require("express");
const router = express.Router();
const { success, failure } = require("../helper/responseHelper.js");
const { ADMIN_CONSTANTS } = require("../config/constant.js")
const { identityManager } = require("../middleware/auth.js");
const { User } = require("../models/user.js");
const { Journal } = require("../models/journal.js")
const { Conference } = require("../models/conference.js")

router.get("/admin", identityManager(["superAdmin"]), async (req, res) => {

    const [activeUsers, inactiveUsers, deletedUsers, totalJournal, totalConference] = await Promise.all([
        User.countDocuments({ status: "active" }),
        User.countDocuments({ status: "inactive" }),
        User.countDocuments({ status: "deleted" }),
        Journal.countDocuments(),
        Conference.countDocuments()
    ]);
    const totalUsers = activeUsers + inactiveUsers;

    let response = {
        totalUsers,
        activeUsers,
        inactiveUsers,
        deletedUsers,
        totalJournal,
        totalConference
    };

    // Extra counts only for admin role

    return success(res, req.apiId, ADMIN_CONSTANTS.SUCCESS, response);
});

module.exports = router;