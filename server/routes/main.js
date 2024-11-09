var express = require('express');
var router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post'); // Nhập mô hình Post
const Category = require('../models/Category'); // Nhập mô hình Category
const authMiddleware = require('../../middlewares/authMiddleware'); // Import authMiddleware

// Route hiển thị trang chủ
router.get('/', async (req, res) => { 
  try {
    const posts = await Post.find(); 
    const categorys = await Category.find(); // Sửa từ categorys thành categories
    res.render('index', {
      title: 'BLOG',
      layout: 'layouts/mainLayout' ,// Kiểm tra xem có phải admin không
      posts,
      categorys, // Đảm bảo truyền biến categories
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
      username 
    });

  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Internal Server Error");
  }
});




// lọc bài viết theo danh mục
module.exports = router;
