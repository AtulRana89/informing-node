// services/paypalService.js
'use strict';

const { Client, Environment, SubscriptionsController } = require('@paypal/paypal-server-sdk');
const config = require('config');

// Initialize PayPal client
const paypalClient = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: config.get('PAYPAL_CLIENT_ID'),
        oAuthClientSecret: config.get('PAYPAL_CLIENT_SECRET'),
    },
    environment: config.get('PAYPAL_ENVIRONMENT') === 'production'
        ? Environment.Production
        : Environment.Sandbox,
});

const subscriptionsController = new SubscriptionsController(paypalClient);

/**
 * Create Subscription - Single function export like your S3 upload
 */
async function createPayPalSubscription({ planId, userData, customId, membershipType }) {
    try {
        if (!planId || !userData || !customId) {
            throw new Error('planId, userData, and customId are required for subscription');
        }

        const requestId = `SUBSCRIPTION-${Date.now()}-${customId}`;

        const request = {
            body: {
                plan_id: planId,
                custom_id: customId,
                application_context: {
                    brand_name: "ISI",
                    locale: "en-US",
                    shipping_preference: "NO_SHIPPING",
                    user_action: "SUBSCRIBE_NOW",
                    payment_method: {
                        payer_selected: "PAYPAL",
                        payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
                    },
                    return_url: `${config.get('FRONTEND_URL')}/subscription/success?customId=${customId}`,
                    cancel_url: `${config.get('FRONTEND_URL')}/subscription/cancel?customId=${customId}`
                },
                subscriber: {
                    name: {
                        given_name: userData.personalName,
                        surname: userData.familyName
                    },
                    email_address: userData.email
                }
            },
            prefer: 'return=representation',
            payPalRequestId: requestId
        };

        const response = await subscriptionsController.subscriptionsCreate(request);
        const subscription = response.result;

        console.log(`PayPal subscription created: ${subscription.id} for user: ${customId}`);

        return {
            statusCode: 201,
            message: "Subscription created successfully",
            subscriptionId: subscription.id,
            status: subscription.status,
            approvalUrl: subscription.links.find(link => link.rel === 'approve')?.href,
            links: subscription.links
        };

    } catch (error) {
        console.error('PayPal subscription creation error:', error);
        throw new Error(`PayPal API Error: ${error.message}`);
    }
}

/**
 * Get Subscription Details
 */
async function getSubscriptionDetails(subscriptionId) {
    try {
        if (!subscriptionId) throw new Error('subscriptionId is required');

        const request = { subscriptionId };
        const response = await subscriptionsController.subscriptionsGet(request);

        return {
            statusCode: 200,
            message: "Subscription details retrieved",
            data: response.result
        };
    } catch (error) {
        console.error('Get subscription error:', error);
        throw error;
    }
}

/**
 * Verify Payment Status
 */
async function verifyPaymentStatus(subscriptionId) {
    try {
        const result = await getSubscriptionDetails(subscriptionId);
        const subscription = result.data;

        const validStatuses = ['ACTIVE', 'APPROVED', 'ACTIVATED'];
        const isActive = validStatuses.includes(subscription.status);

        const latestBillingInfo = subscription.billing_info;
        const lastPayment = latestBillingInfo?.last_payment || {};

        return {
            statusCode: 200,
            isPaymentSuccessful: isActive && lastPayment.status === 'COMPLETED',
            subscriptionStatus: subscription.status,
            lastPayment: lastPayment,
            nextBillingDate: latestBillingInfo?.next_billing_time,
            startDate: subscription.start_time,
            customId: subscription.custom_id
        };
    } catch (error) {
        console.error('Verify payment error:', error);
        throw error;
    }
}

/**
 * Cancel Subscription
 */
async function cancelSubscription({ subscriptionId, reason }) {
    try {
        if (!subscriptionId) throw new Error('subscriptionId is required');

        const request = {
            subscriptionId: subscriptionId,
            body: {
                reason: reason || "Cancelled by user"
            }
        };

        await subscriptionsController.subscriptionsCancel(request);

        console.log(`Subscription ${subscriptionId} cancelled`);

        return {
            statusCode: 200,
            message: "Subscription cancelled successfully"
        };
    } catch (error) {
        console.error('Cancel subscription error:', error);
        throw error;
    }
}

/**
 * Activate Subscription (after approval)
 */
async function activateSubscription({ subscriptionId, payerData }) {
    try {
        if (!subscriptionId) throw new Error('subscriptionId is required');

        const request = {
            subscriptionId: subscriptionId,
            body: {
                payer: payerData || {}
            }
        };

        const response = await subscriptionsController.subscriptionsActivate(request);

        console.log(`Subscription ${subscriptionId} activated`);

        return {
            statusCode: 200,
            message: "Subscription activated successfully",
            data: response.result
        };
    } catch (error) {
        console.error('Activate subscription error:', error);
        throw error;
    }
}

module.exports = {
    createPayPalSubscription,
    getSubscriptionDetails,
    verifyPaymentStatus,
    cancelSubscription,
    activateSubscription
};