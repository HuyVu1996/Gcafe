/**
 * Created by BOSSHIE on 15/4/19.
 */
// Router Item

var router = global.router;
let Item = require('../models/ItemModel');
let BillDetail = require('../models/BillDetailModel');
var mongoose = require('mongoose');
const { check, oneOf, validationResult } = require('express-validator/check');

router.post('/insert_a_item', requiresLogin, [
    check('name', '"name" must be not empty.').trim().not().isEmpty(),
    check('unit_price', '"unit_price" must be not empty, is numeric, >0.').not().isEmpty().isNumeric().isFloat({ gt: 0 }),
    check('uri_image', '"uri_image" must be  not empty.').trim().not().isEmpty(),
], (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(422).json({ errors: errors.array() });
    }
    const newItem = new Item({
        user_id: request.session.user_id,
        name: request.body.name,
        unit_price: request.body.unit_price,
        uri_image: request.body.uri_image,
    });
    Item.findOne({ user_id: request.session.user_id, name: new RegExp('^' + request.body.name.trim() + '$', "i") }).exec((err, item) => {
        if (err) {
            response.json({
                result: "failure",
                message: `Error is : ${err}`
            });
        } else if (item) {
            if (item.activated) {
                response.json({
                    result: "failure",
                    message: `Item name already exists please enter another name.`
                });
            }
            else {
                let conditions = {
                    _id: item._id,
                    user_id: request.session.user_id
                };//search record with "conditions" to update
                let newValues = {
                    activated: true,
                };
                const options = {
                    new: true, // return the modified document rather than the original.
                    multi: true
                }
                Item.findOneAndUpdate(conditions, { $set: newValues }, options, (err, updatedItem) => {
                    if (err) {
                        response.json({
                            result: "failure",
                            message: `Error is : ${err}`
                        });
                    } else {
                        response.json({
                            result: "failure",
                            data: updatedItem,
                            message: "I found an item with a similar name so I activated and restored history to you."
                        });
                    }
                });
            }

        } else {
            newItem.save((err, item) => {
                if (err) {
                    response.json({
                        result: "failure",
                        message: `Error is : ${err}`
                    });
                } else {
                    response.json({
                        result: "success",
                        data: item,
                        message: "Insert new item successfully."
                    });
                }
            });
        }
    });

});

router.get('/get_list_all_items', requiresLogin, (request, response, next) => {
    Item.find({ user_id: request.session.user_id }).limit(100).sort({ name: 1 }).select({
        name: 1,
        unit_price: 1,
        uri_image: 1,
        activated: 1,
    }).exec((err, items) => {
        if (err) {
            response.json({
                result: "failure",
                message: `Error is : ${err}`
            });
        } else {
            response.json({
                result: "success",
                data: items,
                // count: items.length,
                // message: "Query list of items successfully."
            });
        }
    });
});

router.put('/update_a_item', requiresLogin, [
    check('item_id', '"item_id" must be not empty, is objectid.').trim().not().isEmpty().isMongoId(),
    check('name', '"name" must be not empty.').trim().not().isEmpty(),
    check('unit_price', '"unit_price" must be not empty, is numeric.').trim().not().isEmpty(),
    check('uri_image', '"uri_image" must be  not empty.').trim().not().isEmpty(),
], (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(422).json({ errors: errors.array() });
    }
    Item.findOne({ user_id: request.session.user_id, name: new RegExp('^' + request.body.name.trim() + '$', "i") }).exec((err, item) => {
        if (err) {
            response.json({
                result: "failure",
                message: `Error is : ${err}`
            });
        } else if (item && item._id != request.body.item_id) {
            response.json({
                result: "failure",
                message: `Item name already exists please enter another name.`
            });
        } else {
            let conditions = {
                _id: request.body.item_id,
                user_id: request.session.user_id,
            };//search record with "conditions" to update
            let newValues = {
                name: request.body.name,
                unit_price: request.body.unit_price,
                uri_image: request.body.uri_image
            };
            const options = {
                new: true, // return the modified document rather than the original.
                multi: true
            }
            Item.findOneAndUpdate(conditions, { $set: newValues }, options, (err, updatedItem) => {
                if (err) {
                    response.json({
                        result: "failure",
                        message: `Error is : ${err}`
                    });
                } else {
                    response.json({
                        result: "success",
                        data: updatedItem,
                        message: "Update a item successfully."
                    });
                }
            });
        }
    });


});
router.put('/deactivated_a_item', requiresLogin, [
    check('item_id', '"item_id" must be not empty, is objectid.').trim().not().isEmpty().isMongoId(),
], (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(422).json({ errors: errors.array() });
    }
    let conditions = {
        _id: request.body.item_id,
        user_id: request.session.user_id
    };//search record with "conditions" to update
    let newValues = {
        activated: false,
    };
    const options = {
        new: true, // return the modified document rather than the original.
        multi: true
    }
    Item.findOneAndUpdate(conditions, { $set: newValues }, options, (err, updatedItem) => {
        if (err) {
            response.json({
                result: "failure",
                message: `Error is : ${err}`
            });
        } else {
            response.json({
                result: "success",
                data: updatedItem,
                message: "Deactivated a item successful."
            });
        }
    });
});

router.delete('/delete_a_item', requiresLogin, [
    check('item_id', '"item_id" must be not empty, is objectid.').trim().not().isEmpty().isMongoId(),
], (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(422).json({ errors: errors.array() });
    }
    let conditions = {
        _id: request.body.item_id,
        user_id: request.session.user_id
    };//search record with "conditions" to update

    BillDetail.find({ item_id: request.body.item_id }).exec((err, result) => {
        if (err) {
            response.json({
                result: "failure",
                message: `Error is : ${err}`
            });
        } else if (result.length > 0) {
            let newValues = {
                activated: false,
            };
            const options = {
                new: true, // return the modified document rather than the original.
                multi: true
            }
            Item.findOneAndUpdate(conditions, { $set: newValues }, options, (err, updatedItem) => {
                if (err) {
                    response.json({
                        result: "failure",
                        message: `Error is : ${err}`
                    });
                } else {
                    response.json({
                        result: "failure",
                        data: updatedItem,
                        message: "I was deactivated this item because it have revenua in history."
                    });
                }
            });
        } else {
            Item.findOneAndRemove(conditions, (err, item) => {
                if (err) {
                    response.json({
                        result: "failure",
                        message: `Error is : ${err}`
                    });
                } else {
                    response.json({
                        result: "success",
                        data: item,
                        message: "Delete a item successful."
                    });
                }
            });
        }
    });
});

module.exports = router;