/**
 * Created by BOSSHIE on 15/4/19.
 */
// Router User

var router = global.router;
let User = require('../models/UserModel');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
const { check, oneOf, validationResult } = require('express-validator/check');

// midleware requires login
requiresLogin = ((request, response, next) => {
  if (request.session && request.session.user_id) {
    console.log(request.cookies['connect.sid']);
    console.log(request.session.user_id);
    // console.log(request.cookies);
    return next();
  } else {
    // console.log(request.session);
    console.log(request.cookies['connect.sid']);
    response.json({
      result: "failure",
      message: `Bạn phải đăng nhập để yêu cầu chức năng này.`,
    });
  }
});

//get UTC/GMT
getUTC = (() => {
  let UTC = 7;
  return UTC;
});


router.post('/insert_a_user', [
  check('shop_name', '"Tên quán" Không được rỗng.').trim().not().isEmpty(),
  check('address', '"Địa chỉ" Không được rỗng và từ 10-100 kí tự.').trim().isLength({ min: 10, max: 100}),
  check('numberphone', '"Số điện thoại" Không được rỗng và là kiểu số điện thoại.').not().isEmpty().isNumeric().isMobilePhone(),
  check('id', '"Người dùng" Không được rỗng và từ 8-24 kí tự.').trim().isLength({ min: 8, max: 24 }),
  check('password', '"Mật khẩu" Không được rỗng và từ 8-24 kí tự.').isLength({ min: 8, max: 24 }),
], (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).json({ errors: errors.array() });
  }
  User.findOne({ id: request.body.id }).exec(function (err, user) {
    if (err) {
      response.json({
        result: "failure",
        message: `Error is : ${err}`
      });
    } else if (user) {
      response.json({
        result: "failure",
        message: `Tên người dùng đã tồn tại vui lòng nhập tên người dùng khác.`
      });
    } else {
      const newUser = new User({
        shop_name: request.body.shop_name,
        address: request.body.address,
        numberphone: request.body.numberphone,
        id: request.body.id,
        password: request.body.password,
        create_date: new Date(),
      });
      if (newUser.password)
        newUser.password = bcrypt.hashSync(request.body.password, bcrypt.genSaltSync(10), null)
      newUser.save((err, product) => {
        if (err) {
          response.json({
            result: "failure",
            message: `Error is : ${err}`
          });
        } else {
          response.json({
            result: "success",
            user: {
              shop_name: newUser.shop_name,
              address: newUser.address,
              numberphone: newUser.numberphone,
              id: newUser.id,
              password: request.body.password,
            },
            message: "Đăng ký người dùng mới thành công."
          });
        }
      });
    }
  });
});

router.post('/login', [
  check('id', '"Người dùng" Không được rỗng.').trim().not().isEmpty(),
  check('password', '"Mật khẩu" Không được rỗng.').not().isEmpty(),
], (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).json({ errors: errors.array() });
  }
  User.findOne({ id: request.body.id }).exec(function (err, user) {
    if (err) {
      response.json({
        result: "failure",
        message: `Error is : ${err}`
      });
    } else if (!user) {
      response.json({
        result: "failure",
        message: `Người dùng này chưa tồn tại.`,
      });
    } else {
      var res = bcrypt.compareSync(request.body.password, user.password, null);
      if (res) {
        request.session.user_id = user._id;
          if((new Date()-user.create_date>=1000*60*60*24*30*3)&&(!user.activated)){
            response.json({
              result: "failure",
              message: `Require activated your account.`
            });
          }else{
            response.json({
              result: "success",
              user: user,
              message: `Đăng nhập thành công.`
            });
          }
      } else {
        response.json({
          result: "failure",
          message: `Người dùng hoặc mật khẩu không chính xác.`
        });
      }
    }
  });
});

router.put('/update_profile', requiresLogin, [
  check('shop_name', '"Tên quán" Không được rỗng.').trim().not().isEmpty(),
  check('address', '"Địa chỉ" Không được rỗng và từ 10-100 kí tự.').trim().isLength({ min: 10, max: 100}),
  check('numberphone', '"Số điện thoại" Không được rỗng và là kiểu số điện thoại.').not().isEmpty().isNumeric().isMobilePhone(),
  check('id', '"Người dùng" Không được rỗng và từ 8-24 kí tự.').trim().isLength({ min: 8, max: 24 }),
  check('password', '"Mật khẩu" Không được rỗng và từ 8-24 kí tự.').isLength({ min: 8, max: 24 }),
  check('newpassword', '"Mật khẩu mới" Không được rỗng và từ 8-24 kí tự.').isLength({ min: 8, max: 24 }),
], (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).json({ errors: errors.array() });
  }
  User.findOne({ id: request.body.id ,_id:request.session.user_id }).exec(function (err, user) {
    if (err) {
      response.json({
        result: "failure",
        message: `Error is : ${err}`
      });
    } else if (!user) {
      response.json({
        result: "failure",
        message: `Error is : User not found.`,
      });
    } else {
      var res = bcrypt.compareSync(request.body.password, user.password, null);
      if (res) {
        let conditions = { _id: request.session.user_id };//search record with "conditions" to update
        const newValues = {
          shop_name: request.body.shop_name,
          address: request.body.address,
          numberphone: request.body.numberphone,
        };
        if (request.body.newpassword)
          newValues.password = bcrypt.hashSync(request.body.newpassword, bcrypt.genSaltSync(10), null)
        const options = {
          new: true, // return the modified document rather than the original.
          multi: true
        }
        User.findOneAndUpdate(conditions, { $set: newValues }, options, (err, newUser) => {
          if (err) {
            response.json({
              result: "failure",
              message: `Error is : ${err}`
            });
          } else {
            response.json({
              result: "success",
              user: newUser,
              message: "Cập nhật hồ sơ thành công"
            });
          }
        });
      } else {
        response.json({
          result: "failure",
          message: `Sai mật khẩu. Vui lòng nhập lại.`
        });
      }
    }
  });
});

router.get('/profile', requiresLogin, (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).json({ errors: errors.array() });
  }
  User.findById(mongoose.Types.ObjectId(request.session.user_id)).exec(function (err, user) {
    if (err) {
      response.json({
        result: "failure",
        message: `Error is : ${err}`
      });
    } else if (!user) {
      response.json({
        result: "failure",
        User: user,
        message: `Error is : User not found.`,
      });
    } else {
      response.json({
        result: "success",
        User: user,
        message: `Get Profile successfully.`
      });
    }
  });
});

router.get('/logout', requiresLogin, (request, response, next) => {
  if (request.session) {
    request.session.destroy((err) => {
      if (err) {
        response.json({
          result: "failure",
          message: `Error is: ${err}.`
        });
      } else {
        response.json({
          result: "success",
          message: `Đã đăng xuất.`
        });
      }
    });
  }
});

module.exports = router;