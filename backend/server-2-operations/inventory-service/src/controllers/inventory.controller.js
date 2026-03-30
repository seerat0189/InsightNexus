const inventoryService = require("../services/inventory.service");

exports.createItem = async (req, res) => {
  try {
    const data = {
      ...req.body,
      companyId: req.user.companyId,
    };

    const item = await inventoryService.createItem(data);

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

    const result = await inventoryService.updateStock(
      itemId,
      req.user.companyId,
      change,
      type,
      supplierId
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

    await inventoryService.deleteItem(itemId, req.user.companyId);

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