const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    console.log('Fetched categories:', categories); // Add this line
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
