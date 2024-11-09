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
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            req.flash('errorEmail', 'Email không tồn tại!');
            req.flash('email', email);
            req.flash('password',password);
            return res.redirect('/admin/login');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            req.flash('errorPass', 'Mật khẩu không đúng!');
            req.flash('email', email);
            req.flash('password',password);
            return res.redirect('/admin/login');
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
        title: 'Login Page',
        authentication: 'LOGIN',
        layout: 'layouts/mainLayout',
        email: req.flash('email'),  
        password: req.flash('password'), 
        errorEmail: req.flash('errorEmail'),
        errorPass : req.flash('errorPass'),
    });
});



// Router register
router.post('/register',async (req, res)=>{
try{

 const { username, email, password, repassword}= req.body;

 const finduser = await User.findOne({ email });
 if ( finduser){
    req.flash('errorEmail', 'Email đã tồn tại!');
    req.flash('username', username);
    req.flash('email', email);
    req.flash('password', password);
    req.flash('rePassword', repassword);
    return res.redirect('/admin/register');
    }


 if ( password != repassword){
    req.flash('errorPass', 'Mật khẩu xác nhận không khớp!');
    req.flash('username', username);
    req.flash('email', email);
    req.flash('password', password);
    req.flash('rePassword', repassword);
    return res.redirect('/admin/register');
    }


 const hashedPassword = await bcrypt.hash(password, 10);
 const newUser = new User({
    username,
    email,
    password: hashedPassword
    })
 await User.create(newUser);

 res.redirect("/admin/login");
}catch(error){
    console.error("Lỗi khi đăng kí:", error);
    res.status(500).json({ message: "Internal Server Error" });
}
});







// Route hiển thị trang register
router.get('/register', (req, res) => {
    res.render('admin/register', {
        title: 'Register Page',
        authentication: 'LOGIN',
        layout: 'layouts/mainLayout',
        username: req.flash('username'),  
        email: req.flash('email'),  
        password: req.flash('password'),  
        rePassword: req.flash('rePassword'), 
        errorPass: req.flash('errorPass'),  
        errorEmail: req.flash('errorEmail'),  
    });
});



// Route chính (hiển thị bài viết)
router.get('/', authMiddleware, async (req, res) => {
    try {
       
        if(!req.userId){
            return res.redirect("/admin/login");
          }
        const user = await User.findOne({ _id: req.userId });
        const posts = await Post.find(); 
        const categorys = await Category.find(); 
        
        res.render('index', {
            title: 'Admin Page',
            username: user.username,
            layout: "layouts/adminLayout",
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

  if(!req.userId){
    return res.redirect("/admin/login");
  }
  const user = await User.findOne({ _id: req.userId });

  const categorys = await Category.find(); 
  
  res.render('admin/post', {
    title: 'Post Page',
    username: user.username,
    layout: 'layouts/adminLayout',
    categorys
   });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Internal Server Error");
  }
});





module.exports = router;
