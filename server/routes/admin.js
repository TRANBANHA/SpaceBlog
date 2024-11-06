const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Post = require('../models/Post');
const Category = require('../models/Category');

// Kiểm tra xem jwtSecret đã được định nghĩa chưa
if (!jwtSecret) {
    console.error("JWT_SECRET không được định nghĩa!");
    process.exit(1); // Thoát ứng dụng nếu không có JWT_SECRET
}

// Middleware xác thực
const authMiddleware = require('../../middlewares/authMiddleware'); // Điều chỉnh đường dẫn cho phù hợp



// Route đăng nhập
router.post("/", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Vui lòng cung cấp username và password!" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Người dùng không tồn tại!" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Sai mật khẩu!" });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        res.redirect("/admin");
    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
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

// Route chính (hiển thị bài viết)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const posts = await Post.find(); 
        const categorys = await Category.find(); 

        res.render('index', {
            title: 'Admin Page',
            authentication: 'LOGOUT',
            layout: 'layouts/adminLayout',
            posts,
            categorys 
        });
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Route thêm bài viết (sử dụng multer)
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            cb(null, 'public/images');
        } else {
            cb(new Error('Not image'), false);
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.jpg');
    }
});

var upload = multer({ storage: storage });

router.post('/postt', authMiddleware, upload.single('imageURL'), async (req, res) => {
    try {
        const newPost = new Post({
            title: req.body.title,
            body: req.body.body,
            category: req.body.category,
            date: req.body.date,
            imageURL: req.file.filename 
        });
        await Post.create(newPost);
        res.redirect("/admin");
    } catch (error) {
        console.error("Lỗi khi thêm bài viết:", error);
        return res.status(500).send("Internal Server Error");
    }
});

// Route hiển thị trang post
router.get('/post',authMiddleware, async (req, res) => {
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


module.exports = router;
