const ShoppingList = require('../models/ShoppingList');
const Item = require('../models/Item');
const User = require('../models/User');
const mongoose = require('mongoose');

const STANDARD_CATEGORIES = [
  "Produce", "Dairy", "Fridge", "Freezer", "Bakery",
  "Pantry", "Disposable", "Hygiene", "Canned Goods",
  "Organics", "Deli", "Other"
];

const addCustomCategory = async (userId, categoryName) => {
  if (categoryName && !STANDARD_CATEGORIES.includes(categoryName)) {
    const user = await User.findById(userId);
    if (user && !user.customCategories.includes(categoryName)) {
      user.customCategories.push(categoryName);
      await user.save();
    }
  }
};

// Helper to transform item for frontend
const transformItem = (item) => {
  if (!item) return item;
  const obj = item.toObject ? item.toObject() : item;
  
  // Debug: Log transformation
  console.log('🖼️ Transform Debug - Input:', {
    hasImage: !!obj.image,
    hasImageUrl: !!obj.imageUrl,
    imageLength: obj.image ? obj.image.length : 0,
    imageUrlLength: obj.imageUrl ? obj.imageUrl.length : 0
  });
  
  const result = {
    ...obj,
    id: obj._id ? obj._id.toString() : undefined,
    imageUrl: obj.image || obj.imageUrl || null, // Handle both image and imageUrl properties
  };
  
  // Debug: Log transformation result
  console.log('🖼️ Transform Debug - Output:', {
    hasImageUrl: !!result.imageUrl,
    imageUrlLength: result.imageUrl ? result.imageUrl.length : 0,
    mappingSource: obj.image ? 'image field' : obj.imageUrl ? 'imageUrl field' : 'none'
  });
  
  return result;
};

// Get all shopping lists for a user
exports.getLists = async (req, res) => {
  try {
    const lists = await ShoppingList.find({ user: req.user.userId })
      .populate('items')
      .sort({ updatedAt: -1 });
    // Transform items in each list
    const listsWithTransformedItems = lists.map(list => {
      const listObj = list.toObject();
      return {
        ...listObj,
        items: listObj.items.map(transformItem)
      };
    });
    res.json(listsWithTransformedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new shopping list
exports.createList = async (req, res) => {
  try {
    const { name } = req.body;
    const list = new ShoppingList({
      name,
      user: req.user.userId,
      items: []
    });
    const savedList = await list.save();
    res.status(201).json(savedList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a specific shopping list
exports.getList = async (req, res) => {
  try {
    const { listId } = req.params;
    if (!listId || !require('mongoose').Types.ObjectId.isValid(listId)) {
      return res.status(400).json({ message: 'Invalid shopping list ID.' });
    }
    const list = await ShoppingList.findOne({
      _id: listId,
      user: req.user.userId
    }).populate('items');
    
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    const listObj = list.toObject();
    listObj.items = listObj.items.map(transformItem);
    res.json(listObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a shopping list (rename)
exports.updateList = async (req, res) => {
  try {
    const { name } = req.body;
    const list = await ShoppingList.findOneAndUpdate(
      { _id: req.params.listId, user: req.user.userId },
      { name },
      { new: true }
    );
    
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a shopping list
exports.deleteList = async (req, res) => {
  try {
    // Validate ObjectId
    const { listId } = req.params;
    if (!listId || !require('mongoose').Types.ObjectId.isValid(listId)) {
      return res.status(400).json({ message: 'Invalid shopping list ID' });
    }
    const list = await ShoppingList.findOneAndDelete({
      _id: listId,
      user: req.user.userId
    });
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    // Delete all items associated with this list
    await Item.deleteMany({ _id: { $in: list.items } });
    res.json({ message: 'Shopping list deleted' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid shopping list ID format' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Add an item to a shopping list
exports.addItem = async (req, res) => {
  try {
    const list = await ShoppingList.findOne({
      _id: req.params.listId,
      user: req.user.userId
    });
    
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    // Debug: Log incoming request
    console.log('🖼️ Backend Debug - Incoming request:', {
      hasImageUrl: !!req.body.imageUrl,
      hasImage: !!req.body.image,
      imageUrlLength: req.body.imageUrl ? req.body.imageUrl.length : 0,
      imageLength: req.body.image ? req.body.image.length : 0,
      bodyKeys: Object.keys(req.body),
      bodyWithoutImages: Object.fromEntries(
        Object.entries(req.body).filter(([key]) => !['imageUrl', 'image'].includes(key))
      )
    });
    
    // Map imageUrl from frontend to image field for database
    const itemData = { ...req.body };
    if (itemData.imageUrl) {
      itemData.image = itemData.imageUrl;
      delete itemData.imageUrl; // Clean up the original field
      console.log('🖼️ Backend Debug - Mapped imageUrl to image field');
    }
    
    console.log('🖼️ Backend Debug - Data before saving:', {
      hasImage: !!itemData.image,
      imageLength: itemData.image ? itemData.image.length : 0,
      imagePrefix: itemData.image ? itemData.image.substring(0, 50) : 'N/A'
    });
    
    const item = new Item({
      ...itemData,
      userId: req.user.userId
    });
    
    const savedItem = await item.save();
    await addCustomCategory(req.user.userId, savedItem.category);
    list.items.push(savedItem._id);
    await list.save();
    
    // Debug: Log saved item
    console.log('🖼️ Backend Debug - Saved item:', {
      hasImage: !!savedItem.image,
      imageLength: savedItem.image ? savedItem.image.length : 0,
      savedItemKeys: Object.keys(savedItem.toObject())
    });
    
    const transformedItem = transformItem(savedItem);
    
    // Debug: Log transformed result
    console.log('🖼️ Backend Debug - Transformed result:', {
      hasImageUrl: !!transformedItem.imageUrl,
      hasImage: !!transformedItem.image,
      imageUrlLength: transformedItem.imageUrl ? transformedItem.imageUrl.length : 0,
      transformedKeys: Object.keys(transformedItem)
    });
    
    res.status(201).json(transformedItem);
  } catch (error) {
    console.error('✗ Backend: Error saving item:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Remove an item from a shopping list
exports.removeItem = async (req, res) => {
  try {
    const list = await ShoppingList.findOne({
      _id: req.params.listId,
      user: req.user.userId
    });
    
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    
    list.items = list.items.filter(item => item.toString() !== req.params.itemId);
    await list.save();
    
    // Delete the item itself
    await Item.findByIdAndDelete(req.params.itemId);
    
    res.json({ message: 'Item removed from list' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    const list = await ShoppingList.findOne({ _id: listId, user: req.user.userId });
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }
    if (!list.items.some(id => id.toString() === itemId)) {
      return res.status(404).json({ message: 'Item not found in this list' });
    }
    const update = { ...req.body };
    if (update.imageUrl) {
      update.image = update.imageUrl;
      delete update.imageUrl;
    }
    const updatedItem = await Item.findOneAndUpdate(
      { _id: itemId, userId: req.user.userId },
      update,
      { new: true, runValidators: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (updatedItem.category) {
      await addCustomCategory(req.user.userId, updatedItem.category);
    }
    res.json(transformItem(updatedItem));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCategoryItems = async (req, res) => {
  try {
    const { listId } = req.params;
    const { categoryName } = req.body;
    
    if (!listId || !require('mongoose').Types.ObjectId.isValid(listId)) {
      return res.status(400).json({ message: 'Invalid shopping list ID.' });
    }
    
    if (!categoryName) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    // Find the list
    const list = await ShoppingList.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    // Find items in the category
    const itemsInCategory = await Item.find({
      _id: { $in: list.items },
      category: categoryName
    });

    const itemIdsToDelete = itemsInCategory.map(item => item._id);

    if (itemIdsToDelete.length === 0) {
      return res.json({ 
        success: true,
        message: `No items found in category '${categoryName}'.`,
        count: 0
      });
    }

    // Delete the items
    await Item.deleteMany({ _id: { $in: itemIdsToDelete } });
    
    // Remove the items from the list
    await ShoppingList.findByIdAndUpdate(
      listId,
      { $pull: { items: { $in: itemIdsToDelete } } }
    );
    
    res.json({ 
      success: true,
      message: `Removed ${itemIdsToDelete.length} items from category '${categoryName}'.`,
      count: itemIdsToDelete.length
    });
    
  } catch (error) {
    console.error('Error deleting category items:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete category items',
      error: error.message 
    });
  }
};

/**
 * Delete all checked items from a shopping list
 */
exports.deleteCheckedItems = async (req, res) => {
  try {
    const { listId } = req.params;
    
    if (!listId || !require('mongoose').Types.ObjectId.isValid(listId)) {
      return res.status(400).json({ message: 'Invalid shopping list ID.' });
    }

    // Find the list
    const list = await ShoppingList.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    // Find checked items
    const checkedItems = await Item.find({
      _id: { $in: list.items },
      completed: true
    });

    const itemIdsToDelete = checkedItems.map(item => item._id);

    if (itemIdsToDelete.length === 0) {
      return res.json({ 
        success: true,
        message: 'No checked items found to remove.',
        count: 0
      });
    }

    // Delete the checked items
    await Item.deleteMany({ _id: { $in: itemIdsToDelete } });
    
    // Remove the items from the list
    await ShoppingList.findByIdAndUpdate(
      listId,
      { $pull: { items: { $in: itemIdsToDelete } } }
    );
    
    res.json({ 
      success: true,
      message: `Removed ${itemIdsToDelete.length} checked items.`,
      count: itemIdsToDelete.length
    });
    
  } catch (error) {
    console.error('Error deleting checked items:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete checked items',
      error: error.message 
    });
  }
};

exports.exportList = async (req, res) => {
  try {
    const { listId } = req.params;
    const list = await ShoppingList.findOne({ _id: listId, user: req.user.userId }).populate('items');

    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    res.json(list.items.map(transformItem));
  } catch (error) {
    res.status(500).json({ message: 'Error exporting list.' });
  }
};

exports.importList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { items: itemsToImport } = req.body;
    const userId = req.user.userId;

    const list = await ShoppingList.findOne({ _id: listId, user: userId });
    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    if (!Array.isArray(itemsToImport)) {
      return res.status(400).json({ message: "Invalid import data: 'items' must be an array." });
    }

    const newItems = itemsToImport.map(item => ({
      name: item.name,
      category: item.category,
      units: item.units,
      amount: item.amount,
      completed: item.completed || false,
      image: item.imageUrl || item.image,
      priority: item.priority || 'Medium',
      notes: item.notes || '',
      userId: userId,
      _id: new mongoose.Types.ObjectId(), // Ensure new ID
    }));
    
    const createdItems = await Item.insertMany(newItems);
    const newItemIds = createdItems.map(item => item._id);
    const categoriesToUpdate = [...new Set(createdItems.map(item => item.category))];
    
    for (const category of categoriesToUpdate) {
        await addCustomCategory(userId, category);
    }

    list.items.push(...newItemIds);
    await list.save();

    res.status(201).json(createdItems.map(transformItem));
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({ message: 'Error importing list: ' + error.message });
  }
};