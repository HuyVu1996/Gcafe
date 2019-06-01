/**
 * Created by BOSSHIE on 15/4/19.
 */
// Model User

'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    shop_name: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    numberphone: {
        type: String,
        trim: true,
        required: true,
    },
    id: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    activated: {
        type: Boolean,
        default: false,
    },
    create_date: {
        type: Date,
        default: new Date(),
    },
});

module.exports = mongoose.model('User', UserSchema);