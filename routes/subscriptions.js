"use strict"
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { success, failure, successList } = require("../helper/responseHelper.js")
const { createPayPalSubscription, cancelSubscription } = require("../services/paypal.js");
const { Subscription } = require("../models/subscription.js");
const { User } = require("../models/user.js");
const { WebhookData } = require("../models/webhookData.js");

// const { sendFcmNotification } = require("../services/fcmModule.js");

router.post("/paypal/webhook", async (req, res) => {
    try {
        const data = req.body;
        console.log("🔔 PAYPAL WEBHOOK data :", data);
        const webhookEvent = JSON.stringify(req.body);

        console.log("🔔 PAYPAL WEBHOOK RECEIVED :", webhookEvent);
        console.log("Event Type:", webhookEvent.event_type);
        console.log("Event ID:", webhookEvent.id);
        console.log("Resource:", webhookEvent.resource);

        // Example: handle successful payment
        if (data.event_type === "PAYMENT.CAPTURE.COMPLETED") {
            console.log("✅ Payment completed");

            const webhook = new WebhookData({
                data: data, // the entire PayPal webhook payload
            });

            await webhook.save();
            console.log("Webhook saved");

            // await User.updateOne(
            //     { customId: customId },
            //     {
            //         $set: {
            //             subscriptionId,
            //             membershipActive: true,
            //             membershipStatus: "ACTIVE",
            //             membershipStartedAt: new Date()
            //         }
            //     }
            // );

            // console.log("Amount:", webhookEvent.resource.amount.value);
            // console.log("Currency:", webhookEvent.resource.amount.currency_code);
        }

        return res.sendStatus(200);
    } catch (error) {
        console.error('Create subscription error:', error);
        return failure(res, req.apiId, error.message || 'Failed to create subscription');
    }
});

module.exports = router;

// PAYPAL WEBHOOK data : {
//     id: 'WH-7Y7254563A4550640-11V2185806837105M',
//     event_version: '1.0',
//     create_time: '2015-02-17T18:51:33Z',
//     resource_type: 'capture',
//     resource_version: '2.0',
//     event_type: 'PAYMENT.CAPTURE.COMPLETED',
//     summary: 'Payment completed for $ 57.0 USD',
//     resource: {
//       id: '42311647XV020574X',
//       amount: { currency_code: 'USD', value: '57.00' },
//       final_capture: true,
//       seller_protection: { status: 'ELIGIBLE', dispute_categories: [Array] },
//       disbursement_mode: 'DELAYED',
//       seller_receivable_breakdown: {
//         gross_amount: [Object],
//         paypal_fee: [Object],
//         platform_fees: [Array],
//         net_amount: [Object]
//       },
//       invoice_id: '3942619:fdv09c49-a3g6-4cbf-1358-f6d241dacea2',
//       custom_id: 'd93e4fcb-d3af-137c-82fe-1a8101f1ad11',
//       status: 'COMPLETED',
//       supplementary_data: { related_ids: [Object] },
//       create_time: '2022-08-26T18:29:50Z',
//       update_time: '2022-08-26T18:29:50Z',
//       links: [ [Object], [Object], [Object] ]
//     },
//     links: [
//       {
//         href: 'https://api.paypal.com/v1/notifications/webhooks-events/WH-7Y7254563A4550640-11V2185806837105M',
//         rel: 'self',
//         method: 'GET'
//       },
//       {
//         href: 'https://api.paypal.com/v1/notifications/webhooks-events/WH-7Y7254563A4550640-11V2185806837105M/resend',
//         rel: 'resend',
//         method: 'POST'
//       }
//     ]
//   }