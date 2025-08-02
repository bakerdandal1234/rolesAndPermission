const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');

router.post('/books/:bookId/media', mediaController.addMedia);
router.get('/books/:bookId/media', mediaController.getMediaForBook);

module.exports = router;
