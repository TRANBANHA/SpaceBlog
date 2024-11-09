// models/User.js
const mongoose = require('mongoose');

// Tạo schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true, 
      },
      email:{
        type: String,
        required: true,
        unique: true,  
      },

      password: {
        type: String,
        required: true,
      },
});

// Tạo model
const User = mongoose.model('User', userSchema);

module.exports = User; // Xuất model
