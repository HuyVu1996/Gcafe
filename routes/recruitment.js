/**
 * Created by BOSSHIE on 15/4/19.
 */
// Router recruitment

const router = global.router;
// const Recruitment = require('../models/RecruitmentModel');
// const mongoose = require('mongoose');
const transporter = global.transporter;
// const nodemailer = require('nodemailer');
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'G.Ideas2019@gmail.com',
//         pass: 'GIdeasforGCafe2019'
//     }
// });
const  { check, oneOf, validationResult } = require('express-validator/check');

router.post('/insert_a_recruitment',requiresLogin,[
    check('shop_name', '"shop_name" must be not empty.').trim().not().isEmpty(),
    check('address', '"address" must be not empty, >=10 characters.').trim().isLength({ min: 10 }),
    check('numberphone', "numberphone must be Numberic, is MobilePhone").not().isEmpty().isNumeric().isMobilePhone(),
    check('job', '"Chức vụ" Không được rỗng và nhỏ hơn 50 kí tự.').trim().not().isEmpty().isLength({max:50}),
    check('timeworking', '"Thời gian làm việc" Không được rỗng và nhỏ hơn 20 kí tự.').trim().not().isEmpty().isLength({max:20}),
    check('salary', '"Lương" Không được rỗng và nhỏ hơn 20 kí tự.').trim().not().isEmpty().isLength({max:20}),
    check('descriptions', '"Mô tả" Không được rỗng và tư 30-1000 kí tự.').trim().isLength({min:30, max:1000}),
], (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(422).json({ errors: errors.array() });
    }
    let mailOptions = {
        from: 'G.Ideas2019@gmail.com',
        to: 'info@gideas.vn',
        subject: `Máy chủ G.Cafe gửi một TUYỂN DỤNG`,
        text: `Email này được gửi để TUYỂN DỤNG từ ứng dụng GCafe.\n
            \nNgày:${new Date()}
            \nMã ID người gửi: ${request.session.user_id}
            \nTên quán: ${request.body.shop_name}
            \nĐịa chỉ: ${request.body.address}
            \nSố điện thoại: ${request.body.numberphone}
            \nChức vụ: ${request.body.job}
            \nThời gian làm việc: ${request.body.timeworking}
            \nLương: ${request.body.salary}
            \nMô tả: ${request.body.descriptions}
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
                message: "Yêu cầu tuyển dụng thành công.",
            });
        }
    });

    // const newRecruitment = new Recruitment({
    //     user_id: request.session.user_id,
    //     title:request.body.title,
    //     descriptions: request.body.descriptions,
    //     create_date: new Date(),
    // });
    // newRecruitment.save((err) => {
    //     if (err) {
    //         response.json({
    //             result: "failure",
    //             message: `Error is : ${err}`
    //         });
    //     } else {
            // response.json({
            //     result: "success",
            //     data: newRecruitment,
            //     message: "Insert new recruitment successfully.",
            // });
    //     }
    // });

});

module.exports = router;