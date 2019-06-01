/**
 * Created by BOSSHIE on 15/4/19.
 */
// Router Develop

var router = global.router;
let Develop = require('../models/DevelopModel');
var mongoose = require('mongoose');
const  { check, oneOf, validationResult } = require('express-validator/check');
const transporter = global.transporter;

router.post('/insert_a_develop',requiresLogin,[
    check('shop_name', '"shop_name" must be not empty.').trim().not().isEmpty(),
    check('address', '"address" must be not empty, >=10 characters.').trim().isLength({ min: 10 }),
    check('numberphone', "numberphone must be Numberic, is MobilePhone").not().isEmpty().isNumeric().isMobilePhone(),
    check('title', '"title" must be not empty, <= 50 characters.').trim().not().isEmpty().isLength({max:50}),
    check('descriptions', '"descriptions" must be not empty, > 30 characters, <= 1000 characters.').trim().not().isEmpty().isLength({min:30}),
], (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(422).json({ errors: errors.array() });
    }
    let mailOptions = {
        from: 'Gcafe',
        to: 'info@gideas.vn',
        subject: `Sending a develop from server G.Cafe `,
        text:`This email is sent to up DEVELOP from app GCafe.\n
            \ndate:${new Date()}
            \nSender_id: ${request.session.user_id}
            \nshop_name: ${request.body.shop_name}
            \naddress: ${request.body.address}
            \nnumberphone: ${request.body.numberphone}
            \ntitle: ${request.body.title}
            \ndescriptions: ${request.body.descriptions}
            `,
        // html: '<h1>Welcome !</h1><p>This email is sent using Node js with nodemailer. Sender: BOSSHIE</p>'
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
            response.json({
                result: "failure",
                message: `Error is : ${err}`
            });
        } else {
            console.log('Email sent: ' + info.response);
            response.json({
                result: "success",
                message: "Insert new develop successfully.",
            });
        }
    });
    // const newDevelop = new Develop({
    //     user_id: request.session.user_id,
    //     title:request.body.title,
    //     descriptions: request.body.descriptions,
    //     create_date: new Date(),
    // });
    // newDevelop.save((err) => {
    //     if (err) {
    //         response.json({
    //             result: "failure",
    //             message: `Error is : ${err}`
    //         });
    //     } else {
    //         response.json({
    //             result: "success",
    //             data: newDevelop,
    //             message: "Insert new develop successfully.",

    //         });
    //     }
    // });
});

module.exports = router;