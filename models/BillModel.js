/**
 * Created by BOSSHIE on 15/4/19.
 */
// Model Bill

'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BillSchema = new Schema({

    user_id: Schema.ObjectId,

    create_date: {
        type: Date,
        default: new Date(),
    },
    total_money:{
        type: Number,
        default:0,
    }

})
module.exports = mongoose.model('Bill', BillSchema);