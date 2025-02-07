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
            categorys,
            userid:req.userId,
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

router.post('/post', authMiddleware, upload.single('imageURL'), async (req, res) => {
    
    
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


router.get('/edit_post/:postID?',authMiddleware, async (req, res) => {
    try {
  
    if(!req.userId){
      return res.redirect("/admin/login");
    }
  
    const { postID } = req.params;
    let post = null;
    let category = null;
    if (postID) {
      post = await Post.findOne({ _id: postID });
      if (post) {
        category = await Category.findOne({ _id: post.category });
      }
    }
  
    const user = await User.findOne({ _id: req.userId });
  
  
    const categorys = await Category.find(); 
    
    res.render('admin/editpost', {
      title: 'Post Page',
      username: user.username,
      layout: 'layouts/adminLayout',
      categorys,
      category,
      post,
     });
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  

  router.post('/editpost/:postID', authMiddleware, upload.single('imageURL'), async (req, res) => {
    try {
        const { postID } = req.params; // Lấy postID từ params

        // Tạo dữ liệu cập nhật
        const updatedPostData = {
            title: req.body.title,
            body: req.body.body,
            category: req.body.category,
            date: req.body.date,
            imageURL: req.file ? req.file.filename : undefined // Nếu có ảnh mới thì update
        };

        // Cập nhật bài viết
        const updatedPost = await Post.findByIdAndUpdate(postID, updatedPostData, { new: true });

        // Kiểm tra nếu không tìm thấy bài viết
        if (!updatedPost) {
            return res.status(404).send("Post not found");
        }

        // Chuyển hướng về trang admin sau khi cập nhật
        res.redirect("/admin");

    } catch (error) {
        console.error("Lỗi khi cập nhật bài viết:", error);
        return res.status(500).send("Internal Server Error");
    }
});


router.post('/deletepost/:postID', authMiddleware, async (req, res) => {
    try {
        const { postID } = req.params; // Lấy postID từ params
        await Post.findByIdAndDelete(postID);
        res.redirect("/admin");
    } catch (error) {
        console.error("Lỗi khi cập nhật bài viết:", error);
        return res.status(500).send("Internal Server Error");
    }
});

// Route hiển thị trang đổi mật khẩu
router.get('/change-password', async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/admin/login');
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.redirect('/admin/login');
        }

        res.render('admin/changePassword', {
            title: 'Change Password',
            username: user.username,
            error: req.flash('error'),
            success: req.flash('success'),
            layout: 'layouts/adminLayout'
        });
    } catch (error) {
        console.error("Lỗi khi hiển thị trang đổi mật khẩu:", error);
        res.redirect('/admin/login');
    }
});

// Route xử lý đổi mật khẩu
router.post('/change-password', async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/admin/login');
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.redirect('/admin/login');
        }

        // Kiểm tra mật khẩu hiện tại
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            req.flash('error', 'Mật khẩu hiện tại không đúng.');
            return res.redirect('/admin/change-password');
        }

        // Kiểm tra mật khẩu mới và xác nhận mật khẩu
        if (newPassword !== confirmPassword) {
            req.flash('error', 'Mật khẩu mới và xác nhận mật khẩu không khớp.');
            return res.redirect('/admin/change-password');
        }

        // Mã hóa mật khẩu mới và cập nhật
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        req.flash('success', 'Đổi mật khẩu thành công!');
        res.redirect('/admin/change-password');
    } catch (error) {
        console.error("Lỗi khi đổi mật khẩu:", error);
        req.flash('error', 'Đã xảy ra lỗi, vui lòng thử lại!');
        res.redirect('/admin/change-password');
    }
});


// Route hiển thị trang profile
router.get('/profile', authMiddleware ,async (req, res) => {
    try {
        // Giả sử bạn đã có middleware xác thực token và userId
        if (!req.userId) {
            return res.redirect("/admin/login");
        }

        // Truy vấn user từ database
        const user = await User.findOne({ _id: req.userId });

        // Kiểm tra nếu không tìm thấy user
        if (!user) {
            return res.status(404).send("User not found"); // Hoặc redirect nếu cần
        }

    if(user){ 
     res.render('admin/profile', {
            title: 'Profile Page',
            layout: 'layouts/adminLayout',
            username: user.username,  
            email: user.email,  
         
        });
}

       
    } catch (error) {
        console.error('Lỗi khi hiển thị trang profile:', error);
        res.redirect('/admin');
    }
});

// Route xử lý thay đổi profile
router.post('/profile',authMiddleware ,async (req, res) => {
    try {
        const { username, email} = req.body;
        const userId = req.userId; // Lấy từ middleware

        // Cập nhật thông tin người dùng
        await User.findByIdAndUpdate(userId, {
            username,
            email
        });

        req.flash('successMessage', 'Cập nhật thông tin thành công!');
        res.redirect('/admin/profile');
    } catch (error) {
        console.error('Lỗi khi cập nhật profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
module.exports = router;