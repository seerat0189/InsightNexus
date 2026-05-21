const InventoryItem = require("../models/InventoryItem");
const StockHistory = require("../models/StockHistory");
const axios = require("axios");
const { PROCUREMENT_SERVICE } = require("../../../../shared/constants/serviceUrls");

const NOTIFICATION_SERVICE = "http://localhost:5007";

exports.createItem = async (data, token) => {
  const item = await InventoryItem.create(data);

  await StockHistory.create({
    itemId: item._id,
    change: item.quantity,
    type: "add",
    companyId: item.companyId,
    supplierId: data.supplierId || null,
  });

  if (token) {
    try {
      await axios.post(
        `${NOTIFICATION_SERVICE}/api/notifications`,
        {
          type: "general",
          source: "inventory",
          message: `New inventory product '${item.name}' added with initial stock of ${item.quantity} units.`,
          itemId: item._id,
          companyId: item.companyId,
        },
        {
          headers: { Authorization: token },
        }
      );
    } catch (err) {
      console.log("Notification service error:", err.message);
    }
  }

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

  if (token) {
    try {
      const typeLabel = type === "add" ? "added" : type === "usage" ? "consumed" : type === "defect" ? "marked defective" : "adjusted";
      const changeAbs = Math.abs(change);
      await axios.post(
        `${NOTIFICATION_SERVICE}/api/notifications`,
        {
          type: "general",
          source: "inventory",
          message: `Stock ${typeLabel} for '${item.name}': ${change > 0 ? '+' : '-'}${changeAbs} units. Current stock is ${item.quantity}.`,
          itemId: item._id,
          companyId: item.companyId,
        },
        {
          headers: { Authorization: token },
        }
      );
    } catch (err) {
      console.log("Notification service error:", err.message);
    }
  }

  const lowStock = await exports.checkAndTriggerReorder(item, token);

  return { item, lowStock };
};

exports.checkAndTriggerReorder = async (item, token) => {
  const lowStock = item.quantity <= item.reorderLevel;

  if (lowStock) {
    try {
      await axios.post(
        `${NOTIFICATION_SERVICE}/api/notifications`,
        {
          type: "low_stock",
          source: "inventory",
          message: `${item.name} is below reorder level`,
          itemId: item._id,
          companyId: item.companyId,
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

    try {
      console.log(`Checking existing active purchase orders for item ${item.name}...`);
      const ordersRes = await axios.get(
        `${PROCUREMENT_SERVICE}/api/procurement`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      const activeOrderExists = ordersRes.data.orders.some(order => 
        ["pending", "ordered", "shipped"].includes(order.status) &&
        order.items.some(oi => oi.itemId.toString() === item._id.toString())
      );

      if (!activeOrderExists) {
        console.log(`Triggering auto-reorder for item: ${item.name} (reorderLevel: ${item.reorderLevel}, current: ${item.quantity})`);
        await axios.post(
          `${PROCUREMENT_SERVICE}/api/procurement`,
          {
            items: [
              {
                itemId: item._id,
                quantity: item.reorderQuantity,
              }
            ],
            supplierId: item.supplierId || null,
          },
          {
            headers: {
              Authorization: token,
            },
          }
        );
      } else {
        console.log(`Active purchase order already exists for item: ${item.name}. Skipping auto-reorder.`);
      }
    } catch (err) {
      console.log("Auto-procurement trigger error:", err.message);
    }
  }

  return lowStock;
};

exports.updateItem = async (itemId, companyId, updates, token) => {
  const oldItem = await InventoryItem.findOne({ _id: itemId, companyId });
  if (!oldItem) {
    throw new Error("Item not found");
  }

  const oldQuantity = oldItem.quantity;
  const newQuantity = updates.quantity !== undefined ? Number(updates.quantity) : oldQuantity;

  const item = await InventoryItem.findOneAndUpdate(
    { _id: itemId, companyId },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (updates.quantity !== undefined && newQuantity !== oldQuantity) {
    const change = newQuantity - oldQuantity;
    await StockHistory.create({
      itemId,
      change,
      type: "adjustment",
      companyId,
      supplierId: item.supplierId || null,
    });
  }

  if (token) {
    try {
      let message = `Product '${item.name}' details updated.`;
      if (updates.quantity !== undefined && newQuantity !== oldQuantity) {
        const change = newQuantity - oldQuantity;
        const changeAbs = Math.abs(change);
        message = `Product '${item.name}' updated. Stock adjusted by ${change > 0 ? '+' : '-'}${changeAbs} units (Manual Edit). Current stock is ${item.quantity}.`;
      }
      await axios.post(
        `${NOTIFICATION_SERVICE}/api/notifications`,
        {
          type: "general",
          source: "inventory",
          message,
          itemId: item._id,
          companyId,
        },
        {
          headers: { Authorization: token },
        }
      );
    } catch (err) {
      console.log("Notification service error:", err.message);
    }
  }

  const lowStock = await exports.checkAndTriggerReorder(item, token);

  return { item, lowStock };
};


exports.deleteItem = async (itemId, companyId, token) => {
  const item = await InventoryItem.findOneAndDelete({
    _id: itemId,
    companyId,
  });

  if (!item) {
    throw new Error("Item not found");
  }

  if (token) {
    try {
      await axios.post(
        `${NOTIFICATION_SERVICE}/api/notifications`,
        {
          type: "general",
          source: "inventory",
          message: `Inventory product '${item.name}' was removed.`,
          companyId,
        },
        {
          headers: { Authorization: token },
        }
      );
    } catch (err) {
      console.log("Notification service error:", err.message);
    }
  }

  return item;
};