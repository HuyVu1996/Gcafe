/**
 * Created by BOSSHIE on 15/4/19.
 */
// Model Item 

'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ItemSchema = new Schema({

    user_id:Schema.ObjectId,

    name:{
        type:String,
        trim: true,
        required: true,
    },
    unit_price:{
        type:Number,
        default:0,
    },
    uri_image:{
        type:String,
        default:"",
    },
    activated: {
        type: Boolean,
        default: true,
    }
});

module.exports = mongoose.model('Item', ItemSchema);