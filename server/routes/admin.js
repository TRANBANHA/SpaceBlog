const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const multer = require('multer'); 
const path = require('path');
const User = require('../models/User'); // Nhập mô hình User
const Post = require('../models/Post'); // Nhập mô hình Post
const Category = require('../models/Category'); // Nhập mô hình Post

// Kiểm tra xem jwtSecret đã được định nghĩa chưa
if (!jwtSecret) {
    console.error("JWT_SECRET không được định nghĩa!");
    process.exit(1); // Thoát ứng dụng nếu không có JWT_SECRET
}

// Middleware xác thực
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Vui lòng đăng nhập để truy cập" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Route checkLogin
router.post("/", async (req, res) => {
    try {
        const { username, password } = req.body; // Lấy username và password từ req.body

        // Kiểm tra xem username và password có tồn tại không
        if (!username || !password) {
            return res.status(400).json({ message: "Vui lòng cung cấp username và password!" });
        }

        const user = await User.findOne({ username }); // Tìm người dùng trong cơ sở dữ liệu

        if (!user) {
            return res.status(401).json({ message: "Người dùng không tồn tại!" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password); // Kiểm tra mật khẩu
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Sai mật khẩu!" });
        }

        // Tạo token và gửi cookie
        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' }); // Gửi cookie chứa token

        res.redirect("/admin"); 
    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        res.status(500).json({ message: "Internal Server Error" }); // Trả về lỗi nếu có
    }
});






router.get('/get_category', (req, res) => {

});
















// Route hiển thị trang login
router.get('/login', (req, res) => {
  res.clearCookie("token");
  res.render('admin/login', {
    title: 'Admin Page',
    authentication: 'LOGIN',
    layout: 'layouts/mainLayout',
  });
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    // Lấy dữ liệu từ cơ sở dữ liệu
    const posts = await Post.find(); 
    const categorys = await Category.find(); // Đổi từ categorys thành categories

    res.render('index', {
      title: 'Admin Page',
      authentication: 'LOGOUT',
      layout: 'layouts/adminLayout',
      posts,
      categorys // Đảm bảo truyền biến categories
    });

  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Internal Server Error");
  }
});





// Route hiển thị trang post
router.get('/post', async (req, res) => {
    try {
    const categorys = await Category.find(); 
    
    res.render('admin/post', {
       title: 'Post Page',
       authentication:'LOGOUT',
       layout: 'layouts/adminLayout',
       categorys
      });
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      res.status(500).send("Internal Server Error");
    }
  });


  
// Đặt lưu trữ cho multer
var storage = multer.diskStorage({
  destination:function(req, file, cb){
    if( file.mimetype === "image/jpg"||
        file.mimetype === "image/jpeg"||
        file.mimetype === "image/png"){
          cb(null,'public/images');
        } else {
          cb(new Error('Not image'), false);
        }
  },
  filename:function(req, file, cb){
    cb(null, Date.now()+'.jpg');
  }
});
var upload = multer({storage:storage});



router.post('/postt', authMiddleware, upload.single('imageURL'), async (req, res) => {
  try {
      console.log("Bắt đầu xử lý thêm bài viết");
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
        category: req.body.category,
        date: req.body.date,
        imageURL: req.file.filename // Lưu tên file hình ảnh vào trường imageURL trong Post
      });
      await Post.create(newPost);
      res.redirect("/admin");
  } catch (error) {
      console.error("Lỗi khi thêm bài viết:", error); // In lỗi ra console
      return res.status(500).send("Internal Server Error");
  }
});

























router.get('/register', (req, res) => {
  res.render('admin/register', {
     title: 'Register Page',
     authentication:'LOGIN',
     layout: 'layouts/mainLayout'

    })
  
});





module.exports = router;






