/**
 * Created by BOSSHIE on 15/4/19.
 */
//Model Develop
// Router BillDetail

var router = global.router;
let BillDetail = require('../models/BillDetailModel');
let Bill = require('../models/BillModel');
var mongoose = require('mongoose');
const { check, oneOf, validationResult } = require('express-validator/check');

router.post('/insert_a_billdetail', requiresLogin, [
    check('bill_id', '"bill_id" must be not empty,is objectid.').trim().not().isEmpty().isMongoId(),
    check('item_id', '"item_id" must be not empty,is objectid.').trim().not().isEmpty().isMongoId(),
    check('quantity', '"quantity" must be not empty, is numeric, is Int, >0.').trim().not().isEmpty().isNumeric().isInt({gt:0}),
    check('price', '"price" must be not empty, is numeric, >=0.').trim().not().isEmpty().isNumeric().isInt({min:0}),
], (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(422).json({ errors: errors.array() });
    }
    const newBillDetail = new BillDetail({
        bill_id: request.body.bill_id,
        item_id: request.body.item_id,
        quantity: request.body.quantity,
        price: request.body.price,
    });
    newBillDetail.save((err) => {
        if (err) {
            response.json({
                result: "failure",
                data: {},
                message: `Error is : ${err}`
            });
        } else {
            response.json({
                result: "success",
                data: newBillDetail,
                message: "Insert new billdetail successfully."
            });
        }
    });
});

router.post('/insert_a_list_billdetail', requiresLogin,[
    check('bill_id', '"bill_id" must be not empty,is objectid.').trim().not().isEmpty().isMongoId(),
    check('list_billdetail.*.item_id', '"item_id" must be not empty,is objectid.').trim().not().isEmpty().isMongoId(),
    check('list_billdetail.*.quantity', '"quantity" must be not empty, is numeric, is Int, >0.').trim().not().isEmpty().isNumeric().isInt({gt:0}),
    check('list_billdetail.*.price', '"price" must be not empty, is numeric, >=0.').trim().not().isEmpty().isNumeric().isInt({min:0}),
], (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(422).json({ errors: errors.array() });
    }
    list_billdetail = request.body.list_billdetail;
    list_billdetail.forEach(element => {
        const newBillDetail = new BillDetail({
            bill_id: request.body.bill_id,
            item_id: element.item_id,
            quantity: element.quantity,
            price: element.price,
        });
        newBillDetail.save((err) => {
            if (err) {
                response.json({
                    result: "failure",
                    data: {},
                    message: `Error is : ${err}`
                });
                return;
            }
        });
    });
    response.json({
        result: "success",
        data: {
            bill_id: request.body.bill_id,
            list_billdetail: list_billdetail,
        },
        message: "Insert new list billdetail successfully."
    });
});

router.get('/get_revenue_every_item', requiresLogin, (request, response, next) => {
    Bill.find({ user_id: request.session.user_id }).exec((err, bills) => {  //select({_id: true}).
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
            return;
        } else {
            let arr = [];
            bills.forEach(bill => {
                arr.push({ bill_id: bill._id })
            });
            let total_money = 0;
            BillDetail.aggregate([
                {
                    $match: {
                        $or: arr
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalmoney: { $sum: "$price" },
                    }
                }
            ], ((err, result) => {
                if (err) {
                    response.json({
                        result: "failure",
                        message: `Error is : ${err}`
                    });
                    return;
                }

                total_money = result[0].totalmoney;
                // console.log(result);
            }));

            // .exec((err,result) => {
            //     totalmoney = result[0].total_money;
            //     console.log(result[0].total_money);
            // });


            BillDetail.aggregate([
                {
                    $match: {
                        // bill_id : {$or:[mongoose.Types.ObjectId("5cbf67455002e85e98c57143"),mongoose.Types.ObjectId("5cc4c215a8996283dc4bff5a")]}
                        // $or: [{bill_id:mongoose.Types.ObjectId("5cc4c215a8996283dc4bff5a")}]
                        $or: arr
                    }
                },
                {
                    $group: {
                        _id: "$item_id",
                        revenue: { $sum: "$price" },
                        count: { $sum: "$quantity" }
                    },
                },
                {
                    $sort: {
                        revenue: -1,
                    },
                },
            ]).exec((err, items) => {
                if (err) {
                    response.json({
                        result: "failure",
                        message: `Error is : ${err}`
                    });
                } else {
                    items.forEach(item => {
                        item.revenue = Number((item.revenue / total_money * 100).toFixed(2)) //Math.round(item.revenue/total_money*100*100)/100;
                    });
                    response.json({
                        result: "success",
                        data: items,
                        count: items.length,
                        total_money: total_money,
                        message: "Query list revenue of items successfully."
                    });
                }
            });
        }
    })

});

module.exports = router;