const Cart = require('../models/Cart');
const Book = require('../models/Book');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.book',
      populate: [
        { path: 'media' },
        { path: 'category' }
      ]
    });
    if (!cart) {
      return res.status(200).json({ items: [] });
    }
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  const { bookId, quantity, image } = req.body;

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
      // Cart exists for user
      const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);

      if (itemIndex > -1) {
        // Book exists in cart, update quantity
        const newTotalQuantity = cart.items[itemIndex].quantity + quantity;
        if (newTotalQuantity > book.stock) {
          return res.status(400).json({ message: `Cannot add more than available stock (${book.stock})` });
        }
        cart.items[itemIndex].quantity = newTotalQuantity;
      } else {
        // Book does not exist in cart, add new item
        if (quantity > book.stock) {
          return res.status(400).json({ message: `Cannot add more than available stock (${book.stock})` });
        }
        cart.items.push({ book: bookId, quantity, price: book.price, image });
      }
    } else {
      // No cart for user, create new cart
      cart = new Cart({
        user: req.user.id,
        items: [{ book: bookId, quantity, price: book.price, image }],
      });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:bookId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.book.toString() !== req.params.bookId);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/:bookId
// @access  Private
exports.updateQuantity = async (req, res) => {
  const { quantity } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user.id });
    console.log('updateQuantity: Cart found:', cart);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.book.toString() === req.params.bookId);
    console.log('updateQuantity: Item index:', itemIndex);
    console.log(req.params.bookId);
    if (itemIndex > -1) {
      const book = await Book.findById(req.params.bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      if (quantity > book.stock) {
        return res.status(400).json({ message: `Cannot set quantity more than available stock (${book.stock})` });
      }
      cart.items[itemIndex].quantity = quantity;
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get cart count
// @route   GET /api/cart/count
// @access  Private
exports.getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(200).json({ count: 0 });
    }
    const count = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
