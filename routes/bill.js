/**
 * Created by BOSSHIE on 15/4/19.
 */
// Router Bill

var router = global.router;
let Bill = require('../models/BillModel');
var mongoose = require('mongoose');
const { check, oneOf, validationResult } = require('express-validator/check');
// ,'"total_money" must be not Empty, is Numeric, > 0.'
router.post('/insert_a_bill', requiresLogin, [
    check('total_money', '"total_money" must be not Empty, is Numeric, > 0.').trim().not().isEmpty().isNumeric().isFloat({ gt: 0 }),
], (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(422).json({ errors: errors.array() });
    }

    const newBill = new Bill({
        user_id: request.session.user_id,
        total_money: request.body.total_money,
        create_date: new Date(),
    });

    newBill.save((err) => {
        if (err) {
            response.json({
                result: "failure",
                data: {},
                message: `Error is : ${err}`
            });
        } else {
            response.json({
                result: "success",
                data: newBill,
                message: "Insert new Bill successfully",

            });
        }
    });
});
router.get('/get_list_all_bills', requiresLogin, (request, response, next) => {
    Bill.find({ user_id: request.session.user_id }).exec((err, bills) => {
        if (err) {
            response.json({
                result: "failure",
                message: `Error is : ${err}`
            });
            return;
        } else if (bills.length == 0) {
            response.json({
                result: "failure",
                message: "You don't have any bill in history."
            });
        } else {
            let arr = [];
            let aa = { bill_id: null };

            bills.forEach((a, index, array) => {
                aa.bill_id = a._id;
                arr.push(aa)
            });

            // bills.map((a,index,array) => {
            //     aa.bill_id = a._id;
            //     arr.push(aa)
            // })
            response.json({
                result: "success",
                data: bills,
                data2: bills.map(a => a.bill_id = a._id),
                // data3: bills.map((a,index) => {bills[index].bill_id = a._id; return aa[index].bill_id;}),
                data4: aa,
                data5: arr,

                message: "Query list of bills successfully."
            });
        }
    });
});

router.get('/get_revenue_shift', requiresLogin, (request, response, next) => {
    UTC = getUTC();
    Bill.aggregate([
        {

            $match: {
                user_id: { $eq: mongoose.Types.ObjectId(request.session.user_id) }
            },
        },
        {
            $group: {
                _id: { $hour: "$create_date" },
                total_money: { $sum: "$total_money" }
            }
        },
    ]).exec((err, revenueshift) => {
        if (err) {
            response.json({
                result: "failure",
                message: `Error is : ${err}`
            })
        } else if (revenueshift.length == 0) {
            response.json({
                result: "failure",
                message: "You don't have any bill in history."
            })
        } else {
            revenueshift.forEach((element,index) => {
                revenueshift[index]._id =  element._id + UTC<24?element._id + UTC:element._id + UTC-24;
            });
            response.json({
                result: "success",
                data: revenueshift,
                message: "Get total shift successfully."
            })
        }
    })
});

router.get('/get_testing_Date', requiresLogin, (request, response, next) => {
    let now = new Date();//.getTime()%1000*60*60*24 // - 1000 * 60 * 60*24*7;
    let year = now.getFullYear();
    let month = now.getMonth();
    let date = now.getDate();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let milliseconds = now.getMilliseconds()
    let day = new Date().getDay();

    let today2 = new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())//,new Date().getHours())//.getTime()
    // today2.setUTCDate(date);


    let today = new Date(year, month, date, hours, minutes, seconds);// now

    hours = today.getUTCHours();
    minutes = today.getHours();
    today2 = new Date(Date.UTC(year, month, date, 17, minutes, seconds, milliseconds));
    // let today = new Date();// now 
    // today = today.getUTCHours();
    // let today= new Date(year, month, date);// 0h today
    // today.setUTCHours(0),

    // let today= new Date(year, month, date-day+1-7,7); // monday of last week
    // let today= new Date(year, month, date-day+1,7);// monday of this week

    // let today= new Date(year, month-1,1,7);// first date of the last month
    // let today= new Date(year, month,1,7);// first date of the this month

    // let today= new Date(year, month, date-day+1,7);// monday of this week


    // today.setUTCHours(0);
    // today.setHours(hours)

    // now = new Date().getTime(); // 2 func are the same => Numbermiliseconds
    // today = Date.now();
    response.json({
        result: "success",
        now: now,
        data: today,
        data2: today2,
        year: year,
        month: month,
        date: date,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        milliseconds: milliseconds,
        day: day,
        message: "Query list revenue of items successfully"
    });
});

router.get('/get_revenue_today', requiresLogin, (request, response, next) => {
    UTC = getUTC();
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    let date = now.getUTCDate();
    let hours = now.getUTCHours();

    if (hours + UTC >= 24) {
        date++;
    } else if (now.getUTCHours() + UTC < 0) {
        date--;
    }
    let from_time = new Date(year, month, date, UTC);// 0h today
    let to_time = new Date();

    to_time.setDate(date);
    from_time.setUTCHours(-UTC);
    Bill.aggregate([
        {
            $match: {
                create_date: { $gte: from_time, $lt: to_time },
                user_id: { $eq: mongoose.Types.ObjectId(request.session.user_id) }
            },
        }, {
            $group: {
                _id: null,
                total_money: { $sum: "$total_money" }
            }
        }, {
            $project: { _id: 0 }
        }
    ]).exec((err, total_money) => {
        if (err) {
            response.json({
                result: "failure",
                message: `Error is : ${err}`
            })
        } else if (total_money.length == 0) {
            response.json({
                result: "failure",
                period: `From: ${from_time} To: ${to_time}`,
                message: "You don't have any bill in history with this criteria."
            })
        } else {
            response.json({
                result: "success",
                period: `From: ${from_time} To: ${to_time}`,
                data: total_money,
                message: "Get total last week successfully."
            })
        }
    })
});

router.get('/get_revenue_last_month', requiresLogin, (request, response, next) => {
    UTC = getUTC();
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    let from_time = new Date(year, month - 1, 1, UTC);// first date of the last month
    let to_time = new Date(year, month, 1, UTC);// first date of the this month
    from_time.setUTCHours(-UTC);
    to_time.setUTCHours(-UTC);
    Bill.aggregate([
        {
            $match: {
                create_date: { $gte: new Date(from_time), $lt: new Date(to_time) },
                user_id: { $eq: mongoose.Types.ObjectId(request.session.user_id) }
            },
        }, {
            $group: {
                _id: null,
                total_money: { $sum: "$total_money" }
            }
        }, {
            $project: { _id: 0 }
        }
    ]).exec((err, total_money) => {
        if (err) {
            response.json({
                result: "failure",
                message: `Error is : ${err}`
            })
        } else if (total_money.length == 0) {
            response.json({
                result: "failure",
                period: `From: ${from_time} To: ${to_time}`,
                message: "You don't have any bill in history with this criteria."
            })
        } else {
            response.json({
                result: "success",
                period: `From: ${from_time} To: ${to_time}`,
                data: total_money,
                message: "Get total last month successfully."
            })
        }
    })
});
router.get('/get_revenue_last_week', requiresLogin, (request, response, next) => {
    UTC = getUTC();
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    let date = now.getDate();
    let day = now.getDay();
    let from_time = new Date(year, month, date - day + 1 - 7, UTC);// monday of last week
    let to_time = new Date(year, month, date - day + 1, UTC);// monday of this week
    from_time.setUTCHours(-UTC);
    to_time.setUTCHours(-UTC);
    Bill.aggregate([
        {
            $match: {
                create_date: { $gte: new Date(from_time), $lt: new Date(to_time) },
                user_id: { $eq: mongoose.Types.ObjectId(request.session.user_id) }
            },
        }, {
            $group: {
                _id: null,
                total_money: { $sum: "$total_money" }
            }
        }, {
            $project: { _id: 0 }
        }
    ]).exec((err, total_money) => {
        if (err) {
            response.json({
                result: "failure",
                message: `Error is : ${err}`
            })
        } else if (total_money.length == 0) {
            response.json({
                result: "failure",
                period: `From: ${from_time} To: ${to_time}`,
                message: "You don't have any bill in history with this criteria."
            })
        } else {
            response.json({
                result: "success",
                period: `From: ${from_time} To: ${to_time}`,
                data: total_money,
                message: "Get total last week successfully."
            })
        }
    })
});
router.get('/get_revenue_this_week', requiresLogin, (request, response, next) => {
    UTC = getUTC();
    let now = new Date(); // now
    let year = now.getFullYear();
    let month = now.getMonth();
    let date = now.getDate();
    let day = now.getDay();
    let from_time = new Date(year, month, date - day + 1 - ( day<1?7:0), UTC);// monday of this week
    let to_time = new Date();
    from_time.setUTCHours(-UTC);
    Bill.aggregate([
        {
            $match: {
                create_date: { $gte: new Date(from_time), $lt: new Date(now) },
                user_id: { $eq: mongoose.Types.ObjectId(request.session.user_id) }
            },
        }, {
            $group: {
                _id: null,
                total_money: { $sum: "$total_money" }
            }
        }, {
            $project: { _id: 0 }
        }
    ]).exec((err, total_money) => {
        if (err) {
            response.json({
                result: "failure",
                message: `Error is : ${err}`
            })
        } else if (total_money.length == 0) {
            response.json({
                result: "failure",
                period: `From: ${from_time} To: ${to_time}`,
                message: "You don't have any bill in history with this criteria."
            })
        } else {
            response.json({
                result: "success",
                period: `From: ${from_time} To: ${to_time}`,
                data: total_money,
                message: "Get total from monday to today successfully."
            })
        }
    })
});
router.get('/get_revenue_this_month', requiresLogin, (request, response, next) => {
    UTC = getUTC();
    let now = new Date(); // now
    let year = now.getFullYear();
    let month = now.getMonth();
    let date = now.getDate();
    let day = now.getDay();
    let from_time = new Date(year, month, 1, UTC);// monday of this week
    let to_time = new Date();
    from_time.setUTCHours(-UTC);
    Bill.aggregate([
        {
            $match: {
                create_date: { $gte: new Date(from_time), $lt: new Date(now) },
                user_id: { $eq: mongoose.Types.ObjectId(request.session.user_id) }
            },
        }, {
            $group: {
                _id: null,
                total_money: { $sum: "$total_money" }
            }
        }, {
            $project: { _id: 0 }
        }
    ]).exec((err, total_money) => {
        if (err) {
            response.json({
                result: "failure",
                message: `Error is : ${err}`
            })
        } else if (total_money.length == 0) {
            response.json({
                result: "failure",
                period: `From: ${from_time} To: ${to_time}`,
                message: "You don't have any bill in history with this criteria."
            })
        } else {
            response.json({
                result: "success",
                period: `From: ${from_time} To: ${to_time}`,
                data: total_money,
                message: "Get total from monday to today successfully."
            })
        }
    })
});

module.exports = router;