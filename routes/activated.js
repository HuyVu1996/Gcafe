/**
 * Created by BOSSHIE on 15/4/19.
 */
// Router activated

var router = global.router;
let Card = require('../models/CardModel');
var mongoose = require('mongoose');
const { check, oneOf, validationResult } = require('express-validator/check');

router.post('/insert_a_activated', requiresLogin, [
    check('seri', '"seri" Không được rỗng và có từ 12-20 kí tự.').isLength({ min: 12, max: 20 }),
    check('code', '"code" Không được rỗng và có từ 12-20 kí tự.').isLength({ min: 12, max: 20 }),
], (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(422).json({ errors: errors.array() });
    }
    const newCard = new Card({
        user_id: request.session.user_id,
        seri: request.body.seri,
        code: request.body.code,
        create_date: new Date(),
    });
    newCard.save((err) => {
        if (err) {
            response.json({
                result: "failure",
                message: `Error is : ${err}`
            });
        } else {
            response.json({
                result: "success",
                data: newCard,
                message: "Đã kích hoạt thành công. Vui lòng đợi 5-10 phút để hệ thống xác nhận và xử lý.",
            });
        }
    });
});

module.exports = router;