require('dotenv').config(); // Đảm bảo bạn đã yêu cầu dotenv

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const ejsLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose'); // Nhập mongoose
var session = require('express-session'); // Import express-session
const flash = require('connect-flash'); // Import connect-flash để hiển thị thông báo
var adminRouter = require('./server/routes/admin');
var mainRouter = require('./server/routes/main');

var app = express();

// Kết nối đến MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/webblognodejs')
    .then(() => {
        console.log("Kết nối thành công MongoDB");
    })
    .catch(err => {
        console.error("Lỗi kết nối MongoDB:", err);
    });


// Cấu hình session
app.use(session({
    secret: 'yourSecretKey', // Khóa bí mật để mã hóa session
    resave: false, // Không lưu lại session nếu không có thay đổi
    saveUninitialized: true // Lưu lại session ngay cả khi chưa thay đổi
}));

// Nếu dùng flash để hiển thị thông báo
app.use(flash());

// Cấu hình EJS layouts
app.use(ejsLayouts);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', './layouts/mainLayout'); // Layout chính

// Các middleware cần thiết
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Các route
app.use('/', mainRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Khai báo thư mục public chứa các tệp tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình view engine nếu cần
app.set('view engine', 'ejs');  // Giả sử bạn dùng EJS

module.exports = app;
