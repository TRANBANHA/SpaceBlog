var express = require('express');
var router = express.Router();
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
router.get('/search', async (req, res) => { 
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

    const isAdmin = req.cookies.token ? true : false; 
    const authentication = isAdmin ? 'LOGOUT' : 'LOGIN';

    res.render('index', {
      title: 'BLOG',
      layout: isAdmin ? 'layouts/adminLayout' : 'layouts/mainLayout', 
      posts,
      categorys,
      authentication
    });

  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Internal Server Error");
  }
});



// Route thống kê bài viết(cho admin và main)
router.get('/get_pdCatelory/:categoryId?', async (req, res) => { 
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

    const isAdmin = req.cookies.token ? true : false; 
    const authentication = isAdmin ? 'LOGOUT' : 'LOGIN';

    res.render('index', {
      title: 'BLOG',
      layout: isAdmin ? 'layouts/adminLayout' : 'layouts/mainLayout', 
      posts,
      categorys,
      authentication,
    });

  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Internal Server Error");
  }
});




// lọc bài viết theo danh mục
module.exports = router;
