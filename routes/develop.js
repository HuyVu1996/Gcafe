/**
 * Created by BOSSHIE on 15/4/19.
 */
// Router Develop

var router = global.router;
// let Develop = require('../models/DevelopModel');
// var mongoose = require('mongoose');
const { check, oneOf, validationResult } = require('express-validator/check');
const transporter = global.transporter;

router.post('/insert_a_develop', requiresLogin, [
    check('shop_name', '"shop_name" must be not empty.').trim().not().isEmpty(),
    check('address', '"address" must be not empty, >=10 characters.').trim().isLength({ min: 10 }),
    check('numberphone', '"Số điện thoại" Không được rỗng và là kiểu số điện thoại.').not().isEmpty().isNumeric().isMobilePhone(),
    check('title', '"Tiêu đề" Không được rỗng và từ 10-50 kí tự.').trim().not().isEmpty().isLength({min:10, max: 50 }),
    check('descriptions', '"Mô tả" Không được rỗng và từ 30-500 kí tự.').trim().not().isEmpty().isLength({ min: 30 ,max :500}),
], (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(422).json({ errors: errors.array() });
    }
    let mailOptions = {
        from: 'Gcafe',
        to: 'info@gideas.vn',
        subject: `Máy chủ EasyCoffe gửi một PHÁT TRIỂN`,
        text: `Email này được gửi để PHÁT TRIỂN ứng dụng EasyCoffe.\n
            \nNgày:${new Date()}
            \nMã ID người gửi: ${request.session.user_id}
            \nTên quán: ${request.body.shop_name}
            \nĐịa chỉ: ${request.body.address}
            \nSố điện thoại: ${request.body.numberphone}
            \nTiêu đề: ${request.body.title}
            \nMô tả: ${request.body.descriptions}
            `,
        // html: '<h1>Welcome !</h1><p>This email is sent using Node js with nodemailer. Sender: BOSSHIE</p>'
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            // console.log(err);
            response.json({
                result: "failure",
                message: `Error is : ${err}`
            });
        } else {
            // console.log('Email sent: ' + info.response);
            response.json({
                result: "success",
                message: "Gửi tin thành công.",
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