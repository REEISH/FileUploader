const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 16 * 1024 * 1024, // 16 MB max size per upload
  }
});
module.exports = upload;