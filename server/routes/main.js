var express = require('express');
var router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post'); // Nhập mô hình Post
const Category = require('../models/Category'); // Nhập mô hình Category
const authMiddleware = require('../../middlewares/authMiddleware'); // Import authMiddleware


const nodemailer = require('nodemailer');

// Route hiển thị trang chủ
router.get('/',authMiddleware,async (req, res) => { 
  try {
    const posts = await Post.find(); 
    const categorys = await Category.find(); // Sửa từ categorys thành categories
    res.render('index', {
      title: 'BLOG',
      layout: 'layouts/mainLayout' ,// Kiểm tra xem có phải admin không
      posts,
      categorys,
      userid : req.userId,
       // Đảm bảo truyền biến categories
    });

  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Internal Server Error");
  }
});




// Route tìm kiếm bài viết(cho admin và main)
router.get('/search', authMiddleware, async (req, res) => { 
  try {
    const { search } = req.query;
    
    if (!search) {
      return res.status(400).send("Search term is required");
    }

    const searchNoSpecialChar = search.replace(/[^\p{L}\d ]/gu, "");

    // Thực hiện truy vấn tìm kiếm
    const posts = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChar, "i") } }
      ]
    }).collation({ locale: "vi", strength: 2 });

    const categorys = await Category.find();   

    let username = ''; // Mặc định là LOGIN
    let layout = 'layouts/mainLayout'; // Mặc định là mainLayout

    // Kiểm tra xem người dùng đã đăng nhập chưa
   
    if (req.userId) {
      const user = await User.findOne({ _id: req.userId });
      if (user) {
        username = user.username; 
        layout = 'layouts/adminLayout'; 
      }
    }
    console.error(username,layout);
    
    res.render('index', {
      title: 'BLOG',
      layout: layout, 
      posts,
      categorys,
      userid:req.userId,
      username 
    });


  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Internal Server Error");
  }
});







// Route thống kê bài viết(cho admin và main)
router.get('/get_pdCatelory/:categoryId?',authMiddleware, async (req, res) => { 
  try {
    const { categoryId } = req.params;
    
    let posts;
    const categorys = await Category.find();   
    
    if (categoryId) {
      // Nếu có categoryId, tìm bài viết theo danh mục
      posts = await Post.find({ category: categoryId });
    } else {
      // Nếu không có categoryId, lấy tất cả bài viết
      posts = await Post.find();
    }

    let username = ''; // Mặc định là LOGIN
    let layout = 'layouts/mainLayout'; // Mặc định là mainLayout

    // Kiểm tra xem người dùng đã đăng nhập chưa
   
    if (req.userId) {
      const user = await User.findOne({ _id: req.userId });
      if (user) {
        username = user.username; 
        layout = 'layouts/adminLayout'; 
      }
    }
    console.error(username,layout);
    
    res.render('index', {
      title: 'BLOG',
      layout: layout, 
      posts,
      categorys,
      username,
      userid:req.userId,
    });

  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Internal Server Error");
  }
});







router.get('/get_pddetail/:postID?',authMiddleware, async (req, res) => { 
  try {
    const { postID } = req.params;
    const post = await Post.findOne({ _id: postID });
    console.error(post.title)
    const category = await Category.findOne({ _id: post.category });
 

    let username = ''; // Mặc định là LOGIN
    let layout = 'layouts/mainLayout'; // Mặc định là mainLayout

    // Kiểm tra xem người dùng đã đăng nhập chưa
   
    if (req.userId) {
      const user = await User.findOne({ _id: req.userId });
      if (user) {
        username = user.username; 
        layout = 'layouts/adminLayout'; 
      }
    }
    console.error(username,layout);
    
    res.render('detail', {
      title: 'BLOG',
      layout: layout, 
      post,
      category,
      username ,
    });

  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.get('/contact',authMiddleware,async (req, res) => { 
  try {
    res.render('contact', {
      title: 'CONTACT',
      layout: 'layouts/mainLayout' ,// Kiểm tra xem có phải admin không
    });

  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});




const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '',
    pass: ''
  },
  tls: {
    rejectUnauthorized: false   // Đôi khi có thể giúp với các vấn đề kết nối
  }
});

router.post('/contact' ,(req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    // Nếu một trong các trường không tồn tại, trả về thông báo lỗi
    // return res.status(400).send('Title and body are required.');
    res.send('Title and body are required.');
  }

  const mailOptions = {
      from: 'buivanphuc152003@gmail.com',
      to: 'buivanphuc1052003@gmail.com', // Địa chỉ email của admin
      subject: 'New Contact Form Submission',
      text: `Title: ${title}\nBody: ${body}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error(error);
          res.send('Error sending email');
      } else {
          console.log('Email sent: ' + info.response);
          res.send('Email sent successfully');
      }
  });
});




// lọc bài viết theo danh mục
module.exports = router;