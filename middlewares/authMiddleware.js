// // authMiddleware.js
// const jwt = require('jsonwebtoken');
// const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret'; // Lấy từ biến môi trường

// const authMiddleware = (req, res, next) => {
//   const token = req.cookies.token;

//   if (!token) {
//     return res.redirect('admin/login'); // Nếu không có token, chuyển hướng đến trang đăng nhập
//   }

//   try {
//     const decoded = jwt.verify(token, jwtSecret);
//     req.userId = decoded.userId; // Gán userId vào req để sử dụng trong các route sau
//     req.isAdmin = decoded.isAdmin || false; // Gán flag admin cho user nếu có token hợp lệ
//     next();
//   } catch (error) {
//     console.error("Lỗi khi xác thực token:", error);
//     return res.redirect('admin/login'); // Nếu token không hợp lệ, chuyển hướng đến trang đăng nhập
//   }
// };

// module.exports = authMiddleware;





const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret';

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {  // Kiểm tra nếu có token
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.userId = decoded.userId;       // Gán userId vào req để sử dụng trong các route sau
      req.isAdmin = decoded.isAdmin || false; // Gán quyền admin cho user nếu có
    } catch (error) {
      console.error("Lỗi khi xác thực token:", error);
    }
  }
  next(); // Luôn cho phép tiếp tục truy cập route
};

module.exports = authMiddleware;
