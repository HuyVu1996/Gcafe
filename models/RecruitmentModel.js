/**
 * Created by BOSSHIE on 15/4/19.
 */
//Model Recruitment

'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RecruitmentSchema = new Schema ({
    
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

module.exports = mongoose.model('Recruiment',RecruitmentSchema);