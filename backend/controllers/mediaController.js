const Media = require('../models/Media');
const Book = require('../models/Book');

exports.addMedia = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { url } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const newMedia = new Media({ url, book: bookId });
    await newMedia.save();

    book.media.push(newMedia._id);
    await book.save();

    res.status(201).json(newMedia);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMediaForBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const media = await Media.find({ book: bookId });
    res.status(200).json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
