const Book = require('../models/Book');
const Media = require('../models/Media');
const axios = require('axios');
const FormData = require('form-data');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    const books = await Book.find({}).populate(['media', 'category']);
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('media').populate('category');
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    console.error('Error fetching book by ID:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a book
// @route   POST /api/books
// @access  Private/Admin
const createBook = async (req, res) => {
  const { title, author, summary, price, stock, category } = req.body;
  const mediaFiles = req.files;
  let mediaIds = [];

  console.log('createBook: Received mediaFiles:', mediaFiles);

  try {
    const book = new Book({
      title,
      author,
      summary,
      price,
      stock,
      category,
    });

    const createdBook = await book.save();

    if (mediaFiles && mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        const form = new FormData();
        form.append('image', file.buffer.toString('base64'));

        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
          form,
          { headers: { ...form.getHeaders() } }
        );
        const newMedia = new Media({ url: response.data.data.url, book: createdBook._id });
        await newMedia.save();
        mediaIds.push(newMedia._id);
      }
      createdBook.media = mediaIds;
      await createdBook.save(); // Save again after updating media
    }

    res.status(201).json(await createdBook.populate(['media', 'category']));
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(400).json({ message: 'Invalid book data' });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = async (req, res) => {
  const { title, author, summary, price, stock, category } = req.body;
  const mediaFiles = req.files;

  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.summary = summary || book.summary;
    book.price = price || book.price;
    book.stock = stock || book.stock;
    book.category = category || book.category;

    if (mediaFiles && mediaFiles.length > 0) {
      // Delete existing media associated with this book
      await Media.deleteMany({ book: book._id });
      book.media = []; // Clear the media array on the book

      for (const file of mediaFiles) {
        const form = new FormData();
        form.append('image', file.buffer.toString('base64'));

        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
          form,
          { headers: { ...form.getHeaders() } }
        );
        const newMedia = new Media({ url: response.data.data.url, book: book._id });
        await newMedia.save();
        book.media.push(newMedia._id);
      }
    }

    const updatedBook = await book.save();
    res.json(await updatedBook.populate(['media', 'category']));
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(400).json({ message: 'Invalid book data' });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      await book.deleteOne();
      res.json({ message: 'Book removed' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook };
