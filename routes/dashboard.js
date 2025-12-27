"use strict";

const express = require("express");
const router = express.Router();

const { success, failure } = require("../helper/responseHelper.js");
const { ADMIN_CONSTANTS } = require("../config/constant.js");
const { identityManager } = require("../middleware/auth.js");

const { User } = require("../models/user.js");
const { Journal } = require("../models/journal.js");
const { Conference } = require("../models/conference.js");

router.get(
    "/admin",
    identityManager(["superAdmin"]),
    async (req, res) => {
        try {
            const { period = "all", fromDate, toDate } = req.query;

            const getDateFilter = () => {
                let startDate;
                let endDate;

                if (fromDate && toDate) {
                    startDate = new Date(fromDate);
                    endDate = new Date(toDate);
                    endDate.setHours(23, 59, 59, 999);

                    return {
                        insertDate: {
                            $gte: Math.floor(startDate.getTime() / 1000),
                            $lte: Math.floor(endDate.getTime() / 1000),
                        },
                    };
                }

                const now = new Date();

                switch (period) {
                    case "weekly": {
                        // Monday → today
                        const day = now.getDay(); // 0 = Sunday
                        const diff = day === 0 ? -6 : 1 - day;
                        startDate = new Date(now);
                        startDate.setDate(now.getDate() + diff);
                        break;
                    }

                    case "monthly":
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;

                    case "yearly":
                        startDate = new Date(now.getFullYear(), 0, 1);
                        break;

                    default:
                        return {}; // all
                }

                startDate.setHours(0, 0, 0, 0);

                return {
                    insertDate: {
                        $gte: Math.floor(startDate.getTime() / 1000),
                    },
                };
            };

            const dateFilter = getDateFilter();

            const baseUserQuery =
                period === "all" && !fromDate ? {} : dateFilter;

            const baseContentQuery =
                period === "all" && !fromDate ? {} : dateFilter;

            const [
                activeUsers,
                inactiveUsers,
                deletedUsers,
                totalJournal,
                totalConference,
            ] = await Promise.all([
                User.countDocuments({ ...baseUserQuery, status: "active" }),
                User.countDocuments({ ...baseUserQuery, status: "inactive" }),
                User.countDocuments({ ...baseUserQuery, status: "deleted" }),
                Journal.countDocuments(baseContentQuery),
                Conference.countDocuments(baseContentQuery),
            ]);

            const totalUsers = activeUsers + inactiveUsers;

            const response = {
                period,
                fromDate: fromDate || null,
                toDate: toDate || null,
                totalUsers,
                activeUsers,
                inactiveUsers,
                deletedUsers,
                totalJournal,
                totalConference,
            };

            return success(res, req.apiId, ADMIN_CONSTANTS.SUCCESS, response);
        } catch (error) {
            console.error("Dashboard Error:", error);
            return failure(res, req.apiId, error.message);
        }
    }
);

module.exports = router;
