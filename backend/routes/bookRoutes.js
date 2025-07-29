const express = require('express');
const router = express.Router();
const { getBooks, createBook, updateBook, deleteBook, getBookById } = require('../controllers/bookController');
const { authenticateUser, authorizeRole } = require('../middleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route('/').get(getBooks).post(authenticateUser, authorizeRole('admin'), upload.array('images', 5), createBook);
router.route('/:id').get(getBookById).put(authenticateUser, authorizeRole('admin'), upload.array('image', 5), updateBook).delete(authenticateUser, authorizeRole('admin'), deleteBook);

module.exports = router;
