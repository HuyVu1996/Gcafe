/**
 * Created by BOSSHIE on 15/4/19.
 */
// Model Card

'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CardSchema = new Schema({
    
    user_id: Schema.ObjectId,
    
    status:{
        type:Boolean,
        default:false,
    },
    seri:{
        type:String,
        required:true,
    },
    code:{
        type:String,
        required:true,
    },
    create_date: {
        type: Date,
        default: new Date(),
    },
})
module.exports = mongoose.model('Card', CardSchema);