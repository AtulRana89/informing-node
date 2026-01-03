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
        if (data.event_type === "PAYMENT.SALE.COMPLETED") {
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

// Handle PayPal return URL after successful payment
router.get('/paypal/success', async (req, res) => {
    try {
        const { subscriptionId, userId } = req.query;
        console.log('PayPal success handler called with subscriptionId:', subscriptionId, 'and userId:', userId);
        if (!subscriptionId || !userId) {
            return res.status(400).json({
                error: 'Missing subscriptionId or userId'
            });
        }

        // asssss
        const subscription = await Subscription.findOne(
            { paypalSubscriptionId: subscriptionId })


        console.log("subscription data : ", subscription);
        //asssss


        // 1. Get subscription details from PayPal
        // const subscriptionDetails = await getSubscriptionDetails(subscriptionId);

        // 2. Update user in database
        // const user = await User.findById(userId);
        // if (!user) {
        //     return res.status(404).json({ error: 'User not found' });
        // }

        // 3. Update user membership status
        // user.membershipStatus = 'ACTIVE';
        // user.paypalSubscriptionId = subscriptionId;
        // user.subscriptionStatus = 'ACTIVE';
        // await user.save();

        // 4. Update or create subscription record
        // const subscription = await Subscription.findOneAndUpdate(
        //     { paypalSubscriptionId: subscriptionId },
        //     {
        //         userId: userId,
        //         status: 'ACTIVE',
        //         paymentStatus: 'PAID',
        //         startDate: new Date(),
        //         endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        //         lastPaymentDate: new Date()
        //     },
        //     { upsert: true, new: true }
        // );

        // 5. Create payment record
        // if (subscriptionDetails.billing_info && subscriptionDetails.billing_info.last_payment) {
        //     await Payment.create({
        //         userId: userId,
        //         subscriptionId: subscription._id,
        //         paypalSubscriptionId: subscriptionId,
        //         amount: subscriptionDetails.billing_info.last_payment.amount.value,
        //         currency: subscriptionDetails.billing_info.last_payment.amount.currency_code,
        //         status: 'COMPLETED',
        //         paymentDate: new Date(),
        //         transactionId: subscriptionDetails.billing_info.last_payment.id
        //     });
        // }

        // 6. Send confirmation email
        // await sendMembershipConfirmationEmail(user.email, {
        //     userName: `${user.personalName} ${user.familyName}`,
        //     membershipType: user.membershipType,
        //     subscriptionId: subscriptionId,
        //     startDate: new Date().toLocaleDateString()
        // });

        // 7. Redirect to frontend success page
        res.redirect(`http://localhost:3000/join-isi/success?userId=${userId}&subscriptionId=${subscriptionId}`);

    } catch (error) {
        console.error('PayPal success handler error:', error);
        res.redirect(`http://localhost:3000/join-isi/error?message=${encodeURIComponent(error.message)}`);
    }
});

// // Helper function to get subscription details from PayPal
// async function getSubscriptionDetails(subscriptionId) {
//     try {
//         const request = {
//             subscriptionId: subscriptionId
//         };

//         const response = await subscriptionsController.getSubscriptionDetails(request);
//         return response.result;
//     } catch (error) {
//         console.error('Error getting subscription details:', error);
//         throw error;
//     }
// }
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








// 🔔 PAYPAL WEBHOOK data : {
//     id: 'WH-64V49983722610739-6PJ90236AA143151E',
//     event_version: '1.0',
//     create_time: '2026-01-03T06:35:01.442Z',
//     resource_type: 'sale',
//     event_type: 'PAYMENT.SALE.COMPLETED',
//     summary: 'Payment completed for $ 75.0 USD',
//     resource: {
//       billing_agreement_id: 'I-C0PUY8SABESH',
//       amount: { total: '75.00', currency: 'USD', details: [Object] },
//       payment_mode: 'INSTANT_TRANSFER',
//       update_time: '2026-01-03T06:34:57Z',
//       create_time: '2026-01-03T06:34:57Z',
//       protection_eligibility_type: 'ITEM_NOT_RECEIVED_ELIGIBLE,UNAUTHORIZED_PAYMENT_ELIGIBLE',
//       transaction_fee: { currency: 'USD', value: '3.81' },
//       protection_eligibility: 'ELIGIBLE',
//       links: [ [Object], [Object] ],
//       id: '9WF66082R84241037',
//       state: 'completed',
//       invoice_number: ''
//     },
//     links: [
//       {
//         href: 'https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-64V49983722610739-6PJ90236AA143151E',
//         rel: 'self',
//         method: 'GET'
//       },
//       {
//         href: 'https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-64V49983722610739-6PJ90236AA143151E/resend',
//         rel: 'resend',
//         method: 'POST'
//       }
//     ]
//   }