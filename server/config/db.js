const mongoose = require('mongoose');
const User = require('../models/User'); 
const Category = require('../models/Category'); 
const Post = require('../models/Post'); 
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://127.0.0.1:27017/webblognodejs', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log("Kết nối thành công Mongodb");

        try {
            // Mã hóa mật khẩu
            const hashedPassword1 = await bcrypt.hash("1234a", 10);
            const hashedPassword2 = await bcrypt.hash("1234a", 10);
            
            // Thêm dữ liệu cho User
            await User.create([
                { username: "buivanphuc152003@", password: hashedPassword1 },
                { username: "buivanphuc@", password: hashedPassword2 },
            ]);
            console.log("Dữ liệu User đã được thêm vào thành công");

            // Thêm dữ liệu cho Category
            const categories = await Category.create([
                { name: 'tech' },
                { name: 'health' },
                { name: 'finance' },
                { name: 'education' },
                { name: 'entertainment' },
            ]);
            console.log("Các category đã được thêm vào thành công");

            // Thêm dữ liệu cho Post
            await Post.create([
                {
                    title: "Cách xây dựng ứng dụng Node.js",
                    body: "Hướng dẫn từng bước để xây dựng một ứng dụng Node.js.",
                    category: "finance", // Tham chiếu đến category đầu tiên
                    date: "22/05/2003",
                    imageURL: "banner_img1.png",
                },
                {
                    title: "Xu hướng công nghệ 2024",
                    body: "Tổng hợp các xu hướng công nghệ nổi bật trong năm 2024.",
                    category: "education", // Tham chiếu đến category thứ hai
                    date: "22/05/2003",
                    imageURL: "banner_img1.png",
                },
               
            ]);
            console.log("Dữ liệu Post đã được thêm vào thành công");
        } catch (error) {
            console.error("Lỗi khi thêm dữ liệu:", error);
        } finally {
            // Đóng kết nối sau khi hoàn thành
            mongoose.connection.close();
        }
    })
    .catch(err => {
        console.error("Lỗi kết nối MongoDB:", err);
    });
