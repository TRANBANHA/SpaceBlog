var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
  res.render('index', { title: 'User Page' }); // Truyền title cho layout
  
});


module.exports = router;
