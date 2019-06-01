/**
 * Created by BOSSHIE on 15/4/19.
 */
// Model Bill Detail

'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BillDetailSchema = new Schema ({

    bill_id: {
        type:Schema.ObjectId,
        required: true,
    },
    item_id: {
        type:Schema.ObjectId,
        required: true,
    },

    quantity:{
        type:Number,
        default:1,
    },
    price:{
        type:Number,
        default:0,
    }
    
});

module.exports = mongoose.model('BillDetail',BillDetailSchema);