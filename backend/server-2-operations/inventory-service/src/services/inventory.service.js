const InventoryItem = require("../models/InventoryItem");
const StockHistory = require("../models/StockHistory");
const axios = require("axios");

const NOTIFICATION_SERVICE = "http://localhost:5007";

exports.createItem = async (data) => {
  const item = await InventoryItem.create(data);

  await StockHistory.create({
    itemId: item._id,
    change: item.quantity,
    type: "add",
    companyId: item.companyId,
    supplierId: data.supplierId || null,
  });

  return item;
};

exports.getItems = async (companyId) => {
  return await InventoryItem.find({ companyId });
};

exports.updateStock = async (
  itemId,
  companyId,
  change,
  type,
  supplierId = null,
  token
) => {
  if (!["add", "usage", "adjustment", "defect"].includes(type)) {
    throw new Error("Invalid stock type");
  }

  if (typeof change !== "number" || change === 0) {
    throw new Error("Invalid stock change");
  }

  if (type === "add" && change < 0) {
    throw new Error("Add operation must increase stock");
  }

  if (["usage", "defect"].includes(type) && change > 0) {
    throw new Error(`${type} operation must reduce stock`);
  }

  const item = await InventoryItem.findOne({ _id: itemId, companyId });

  if (!item) {
    throw new Error("Item not found");
  }

  const newQuantity = item.quantity + change;

  if (newQuantity < 0) {
    throw new Error("Stock cannot go below zero");
  }

  item.quantity = newQuantity;
  await item.save();

  await StockHistory.create({
    itemId,
    change,
    type,
    companyId,
    supplierId,
  });

  const lowStock = item.quantity < item.reorderLevel;

  if (lowStock) {
    try {
      await axios.post(
        `${NOTIFICATION_SERVICE}/api/notifications`,
        {
          type: "low_stock",
          source: "inventory",
          message: `${item.name} is below reorder level`,
          itemId: item._id,
          companyId,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

    } catch (err) {
      console.log("Notification service error:", err.message);
    }
  }

  return { item, lowStock };
};

exports.deleteItem = async (itemId, companyId) => {
  const item = await InventoryItem.findOneAndDelete({
    _id: itemId,
    companyId,
  });

  if (!item) {
    throw new Error("Item not found");
  }

  return item;
};