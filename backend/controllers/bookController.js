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
  const images = req.files;
  let imageUrls = [];

  if (images && images.length > 0) {
    for (const image of images) {
      const form = new FormData();
      form.append('image', image.buffer.toString('base64'));

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        form,
        { headers: { ...form.getHeaders() } }
      );

      imageUrls.push(response.data.data.url);
    }
  }


  try {
    const book = new Book({
      title,
      author,
      summary,
      price,
      stock,
      images: imageUrls,
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
  const images = req.files;
let imageUrls = [];

if (images && images.length > 0) {
  for (const image of images) {
    const form = new FormData();
    form.append('image', image.buffer.toString('base64'));

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      form,
      { headers: { ...form.getHeaders() } }
    );

    imageUrls.push(response.data.data.url);
  }
}
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    

    book.title = title || book.title;
    book.author = author || book.author;
    book.summary = summary || book.summary;
    book.price = price || book.price;
    book.images = imageUrls.length > 0 ? imageUrls : book.images;
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
