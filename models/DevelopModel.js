/**
 * Created by BOSSHIE on 15/4/19.
 */
//Model Develop

'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DevelopSchema = new Schema ({
    
    user_id: Schema.ObjectId,
    title:{
        type:String,
        required: true,
    },
    descriptions:{
        type:String,
        required: true,
    },
    create_date: {
        type: Date,
        default: new Date(),
    },
});

module.exports = mongoose.model('Develop',DevelopSchema);