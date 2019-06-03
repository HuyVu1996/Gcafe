/**
 * Created by BOSSHIE on 15/4/19.
 */
//Router Category

// var express = require('express');
// var router = express.Router();

global.router = require('express').Router();
var router = global.router;
const nodemailer = require('nodemailer');
global.transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'G.Ideas2019@gmail.com',
        pass: 'GIdeasforGCafe2019'
    }
});

router = require('./user');
router = require('./bill');
router = require('./item');
router = require('./billdetail');
router = require('./recruitment');
router = require('./develop');
router = require('./activated');

/* GET home page. */
router.get('/', (request, response, next) => {
    response.render('index', { title: 'SERVER GCAFE' });
});

module.exports = router;
