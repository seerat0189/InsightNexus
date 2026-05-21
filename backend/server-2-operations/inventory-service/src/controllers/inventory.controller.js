const inventoryService = require("../services/inventory.service");
const InventoryItem = require("../models/InventoryItem");

exports.createItem = async (req, res) => {
  try {
    const data = {
      ...req.body,
      companyId: req.user.companyId,
    };

    const token = req.headers.authorization;
    const item = await inventoryService.createItem(data, token);

    res.status(201).json({
      success: true,
      item,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getItems = async (req, res) => {
  try {
    const items = await inventoryService.getItems(req.user.companyId);

    res.status(200).json({
      success: true,
      items,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { change, type, supplierId } = req.body;

    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    if (typeof change !== "number") {
      return res.status(400).json({
        success: false,
        message: "Change must be a number",
      });
    }

    const validTypes = ["add", "usage", "adjustment", "defect"];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock type",
      });
    }

    const result = await inventoryService.updateStock(
      itemId,
      req.user.companyId,
      change,
      type,
      supplierId,
      token
    );

    res.status(200).json({
      success: true,
      item: result.item,
      lowStock: result.lowStock,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const token = req.headers.authorization;

    await inventoryService.deleteItem(itemId, req.user.companyId, token);

    res.status(200).json({
      success: true,
      message: "Item deleted",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateReorder = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { reorderLevel, reorderQuantity } = req.body;

    const item = await InventoryItem.findOneAndUpdate(
      { _id: itemId, companyId: req.user.companyId },
      { reorderLevel, reorderQuantity },
      { new: true }
    );

    res.status(200).json({
      success: true,
      item,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.reduceStock = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, type = "usage" } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be positive",
      });
    }

    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const result = await inventoryService.updateStock(
      itemId,
      req.user.companyId,
      -Math.abs(quantity),
      type,
      null,
      token
    );

    res.status(200).json({
      success: true,
      item: result.item,
      lowStock: result.lowStock,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const updates = req.body;
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const result = await inventoryService.updateItem(
      itemId,
      req.user.companyId,
      updates,
      token
    );

    res.status(200).json({
      success: true,
      item: result.item,
      lowStock: result.lowStock,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
