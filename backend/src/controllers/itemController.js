const Item = require('../models/Item');
const mongoose = require('mongoose');

// Transform MongoDB document to match frontend format
const transformItem = (item) => {
  const transformed = item.toObject();
  return {
    id: transformed._id.toString(),
    name: transformed.name,
    category: transformed.category,
    units: transformed.units,
    amount: transformed.amount,
    imageUrl: transformed.image,
    isCompleted: transformed.completed,
    _id: transformed._id, // Keep original _id for internal use
    userId: transformed.userId,
    createdAt: transformed.createdAt,
    updatedAt: transformed.updatedAt
  };
};

// Get all items for a user
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find({ userId: req.user.userId }).sort({ updatedAt: -1 });
    res.json(items.map(transformItem));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new item
exports.createItem = async (req, res) => {
  try {
    const { name, quantity, amount, units, category, imageUrl } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({ message: 'Name and category are required' });
    }

    const newItem = new Item({
      name,
      quantity: quantity || 1,
      amount: amount || 1,
      units: units || 'pcs',
      category,
      image: imageUrl || null,
      userId: req.user.userId
    });

    const savedItem = await newItem.save();
    res.status(201).json(transformItem(savedItem));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an item
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    const { name, quantity, amount, units, category, imageUrl, completed } = req.body;
    
    const update = {
      ...(name && { name }),
      ...(quantity && { quantity }),
      ...(amount && { amount }),
      ...(units && { units }),
      ...(category && { category }),
      ...(imageUrl && { image: imageUrl }),
      ...(completed !== undefined && { completed })
    };
    
    const item = await Item.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      update,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(transformItem(item));
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid item ID format' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    const item = await Item.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid item ID format' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete checked items
exports.deleteCheckedItems = async (req, res) => {
  try {
    const result = await Item.deleteMany({
      userId: req.user.userId,
      completed: true
    });
    res.json({ message: `${result.deletedCount} items deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete items by category
exports.deleteCategoryItems = async (req, res) => {
  try {
    const { categoryName } = req.body;
    
    if (!categoryName) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const result = await Item.deleteMany({
      userId: req.user.userId,
      category: categoryName
    });

    res.json({ message: `${result.deletedCount} items deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 