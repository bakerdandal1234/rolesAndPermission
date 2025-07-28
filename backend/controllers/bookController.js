const Book = require('../models/Book');
const axios = require('axios');
const FormData = require('form-data');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    const books = await Book.find({});
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
    const book = await Book.findById(req.params.id);
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
  const { title, author, summary, price, stock } = req.body;
  const image = req.file;

  let imageUrl = '';

  if (image) {
    try {
      const form = new FormData();
      form.append('image', image.buffer.toString('base64'));
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, form, {
        headers: {
          ...form.getHeaders()
        }
      });
      imageUrl = response.data.data.url;
    } catch (error) {
      console.error('Error uploading image to imgbb:', error);
      return res.status(500).json({ message: 'Error uploading image' });
    }
  }

  try {
    const book = new Book({
      title,
      author,
      summary,
      price,
      stock,
      image: imageUrl,
    });

    const createdBook = await book.save();
    res.status(201).json(createdBook);
  } catch (error) {
    res.status(400).json({ message: 'Invalid book data' });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = async (req, res) => {
  const { title, author, summary, price, stock } = req.body;
  const image = req.file;

  console.log('updateBook - req.file:', image);

  let imageUrl;

  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (image) {
      try {
        const form = new FormData();
        form.append('image', image.buffer.toString('base64'));
        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, form, {
          headers: {
            ...form.getHeaders()
          }
        });
        imageUrl = response.data.data.url;
      } catch (error) {
        console.error('Error uploading image to imgbb:', error);
        return res.status(500).json({ message: 'Error uploading image' });
      }
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.summary = summary || book.summary;
    book.price = price || book.price;
    book.image = imageUrl || book.image;
    book.stock = stock || book.stock;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
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
