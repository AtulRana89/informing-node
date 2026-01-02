"use strict"

const mongoose = require("mongoose");
const { Admin } = require("../models/admin.js");
const { Plan } = require("../models/plan.js");
const { generateHash } = require("../services/bcrypt.js");
const config = require("config");

const environment = config.get("environment");

module.exports = async function () {
    try {
        let query = { email: "admin1@support.com" }
        let admin = await Admin.findOne(query);

        if (!admin) {
            let defaultPassword = '12345678';
            let password = generateHash(defaultPassword);

            let newAdmin = {
                email: "admin1@support.com",
                password: password,
                admin: true,
            }
            await Admin.create(newAdmin);

        }

    } catch (err) {
        console.error("Error seeding database:", err);
    }

    try {
        const count = await Plan.countDocuments();

        // ✅ If plans already exist, skip seeding
        if (count > 0) {
            console.log("Plans already exist. Skipping seed.");
            return;
        }
        const plans = [
            {
                id: "P-98P507856D497622UNFETDNA",
                version: 1,
                product_id: "PROD-4KP56367VU896645C",
                planType: "1y-basic",
                name: "1 Year",
                status: "ACTIVE",
                description: "Basic membership for 1 year",
                usage_type: "LICENSED",
                billing_cycles: [
                    {
                        pricing_scheme: {
                            version: 1,
                            fixed_price: {
                                currency_code: "USD",
                                value: "75.0"
                            },
                            create_time: new Date("2025-12-22T11:55:32Z"),
                            update_time: new Date("2025-12-22T11:55:32Z")
                        },
                        frequency: {
                            interval_unit: "YEAR",
                            interval_count: 1
                        },
                        tenure_type: "REGULAR",
                        sequence: 1,
                        total_cycles: 1
                    }
                ],
                payment_preferences: {
                    service_type: "PREPAID",
                    auto_bill_outstanding: true,
                    setup_fee: { currency_code: "USD", value: "0.0" },
                    setup_fee_failure_action: "CONTINUE",
                    payment_failure_threshold: 3
                },
                taxes: { percentage: "0.0", inclusive: false },
                quantity_supported: false,
                payee: {
                    merchant_id: "JA5LJSP4AEF6J",
                    display_data: {
                        business_email: "cs-sb-ueo2x47642986@business.example.com",
                        business_phone: {
                            country_code: "91",
                            national_number: "+91 9520481068"
                        }
                    }
                },
                create_time: new Date("2025-12-22T11:55:32Z"),
                update_time: new Date("2025-12-22T11:55:32Z"),
                links: [
                    {
                        href: "https://api.sandbox.paypal.com/v1/billing/plans/P-98P507856D497622UNFETDNA",
                        rel: "self",
                        method: "GET",
                        encType: "application/json"
                    }
                ]
            },

            {
                id: "P-60U54129JF267354NNFETFXY",
                version: 1,
                product_id: "PROD-2J870760NC067493P",
                planType: "1y-sponsor",
                name: "Sponsoring - 1 Year",
                status: "ACTIVE",
                description: "Sponsoring membership for 1 year",
                usage_type: "LICENSED",
                billing_cycles: [
                    {
                        pricing_scheme: {
                            version: 1,
                            fixed_price: { currency_code: "USD", value: "125.0" },
                            create_time: new Date("2025-12-22T12:00:31Z"),
                            update_time: new Date("2025-12-22T12:00:31Z")
                        },
                        frequency: { interval_unit: "YEAR", interval_count: 1 },
                        tenure_type: "REGULAR",
                        sequence: 1,
                        total_cycles: 1
                    }
                ],
                payment_preferences: {
                    service_type: "PREPAID",
                    auto_bill_outstanding: true,
                    setup_fee: { currency_code: "USD", value: "0.0" },
                    setup_fee_failure_action: "CONTINUE",
                    payment_failure_threshold: 3
                },
                taxes: { percentage: "0.0", inclusive: false },
                quantity_supported: false,
                payee: {
                    merchant_id: "JA5LJSP4AEF6J",
                    display_data: {
                        business_email: "cs-sb-ueo2x47642986@business.example.com"
                    }
                },
                create_time: new Date("2025-12-22T12:00:31Z"),
                update_time: new Date("2025-12-22T12:00:31Z")
            },

            {
                id: "P-7GB94956Y9580284ANFETJOY",
                name: "Sponsoring - 5 Year",
                description: "Sponsoring membership for 5 year",
                status: "ACTIVE",
                version: 1,
                product_id: "PROD-2J870760NC067493P",
                planType: "5y-sponsor",
                usage_type: "LICENSED",
                billing_cycles: [{
                    pricing_scheme: {
                        fixed_price: { currency_code: "USD", value: "500.0" }
                    },
                    frequency: { interval_unit: "YEAR", interval_count: 1 },
                    tenure_type: "REGULAR",
                    sequence: 1,
                    total_cycles: 5
                }]
            },

            {
                id: "P-5VR93344AX120281NNFETKWY",
                name: "Sponsoring - Life",
                description: "Lifetime sponsoring membership",
                status: "ACTIVE",
                version: 1,
                product_id: "PROD-2J870760NC067493P",
                planType: "life-sponsor",
                usage_type: "LICENSED",
                billing_cycles: [{
                    pricing_scheme: {
                        fixed_price: { currency_code: "USD", value: "5000.0" }
                    },
                    frequency: { interval_unit: "YEAR", interval_count: 1 },
                    tenure_type: "REGULAR",
                    sequence: 1,
                    total_cycles: 99
                }]
            },

            {
                id: "P-3C184425140228839NFETLEY",
                name: "Basic - Life",
                description: "Basic sponsoring membership",
                status: "ACTIVE",
                version: 1,
                product_id: "PROD-4KP56367VU896645C",
                planType: "life-basic",
                usage_type: "LICENSED",
                billing_cycles: [{
                    pricing_scheme: {
                        fixed_price: { currency_code: "USD", value: "1000.0" }
                    },
                    frequency: { interval_unit: "YEAR", interval_count: 1 },
                    tenure_type: "REGULAR",
                    sequence: 1,
                    total_cycles: 99
                }]
            },

            {
                id: "P-4G4391977B902291XNFETLNI",
                name: "Basic - 5 Year",
                description: "Basic membership for 5 years",
                status: "ACTIVE",
                version: 1,
                product_id: "PROD-4KP56367VU896645C",
                planType: "5y-basic",
                usage_type: "LICENSED",
                billing_cycles: [{
                    pricing_scheme: {
                        fixed_price: { currency_code: "USD", value: "300.0" }
                    },
                    frequency: { interval_unit: "YEAR", interval_count: 1 },
                    tenure_type: "REGULAR",
                    sequence: 1,
                    total_cycles: 5
                }]
            }
        ];

        await Plan.insertMany(plans);
        console.log("Plans seeded successfully ✅");

    } catch (err) {
        console.error("Error seeding plans:", err);
    }
};




