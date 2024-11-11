
// const jwt = require('jsonwebtoken');
// const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret';
// const User = require('../server/models/User');


// const authMiddleware = async (req, res, next) => {
//   const token = req.cookies.token;

//   if (token) {  // Kiểm tra nếu có token
//     try {
//       const decoded = jwt.verify(token, jwtSecret);
//       const user = await User.findById(req.userId);
//       req.username = user.username || 'LOGOUT';
//       req.layout = 'layouts/adminLayout';
//       req.userId = decoded.userId;       // Gán userId vào req để sử dụng trong các route sau
//     } catch (error) {
//       console.error("Lỗi khi xác thực token:", error);
//     }
//   } else {
//     req.username = 'LOGIN';
//     req.layout = 'layouts/mainLayout';
//   }
//   next();
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
    } catch (error) {
      console.error("Lỗi khi xác thực token:", error);
    }
  }
  next(); // Luôn cho phép tiếp tục truy cập route
};

module.exports = authMiddleware;
