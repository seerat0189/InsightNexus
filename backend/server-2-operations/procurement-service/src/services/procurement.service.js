const PurchaseOrder = require("../models/PurchaseOrder");
const axios = require("axios");

const { INVENTORY_SERVICE, SUPPLIER_SERVICE, FINANCE_SERVICE } = require("../../../../shared/constants/serviceUrls");

const getAuthHeader = (token) => ({
  Authorization: token && token.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`,
});

exports.createOrder = async (data, token) => {
  if (!data.items || data.items.length === 0) {
    throw new Error("Items required");
  }

  const inventoryRes = await axios.get(
    `${INVENTORY_SERVICE}/api/inventory`,
    {
      headers: getAuthHeader(token),
    }
  );

  const inventoryItems = inventoryRes.data.items;

  for (let item of data.items) {
    const inventoryItem = inventoryItems.find(
      (i) => i._id === item.itemId
    );

    if (!inventoryItem) {
      throw new Error("Inventory item not found");
    }

    if (!item.quantity) {
      item.quantity = inventoryItem.reorderQuantity || 10;
    }

    if (inventoryItem.reorderQuantity < inventoryItem.reorderLevel) {
      console.log(
        `Warning: reorderQuantity < reorderLevel for item ${inventoryItem.name}`
      );
    }
  }

  let supplierId = data.supplierId;

  if (!supplierId) {
    const res = await axios.get(
      `${SUPPLIER_SERVICE}/api/supplier/best`,
      {
        headers: getAuthHeader(token),
      }
    );

    supplierId = res.data.supplier._id;
  }

  const order = await PurchaseOrder.create({
    ...data,
    supplierId,
  });

  return order;
};
exports.getOrders = async (companyId) => {
  return await PurchaseOrder.find({ companyId });
};

exports.updateOrderStatus = async (orderId, status, token) => {
  const allowedStatus = ["pending", "ordered", "shipped", "delivered"];

  if (!allowedStatus.includes(status)) {
    throw new Error("Invalid status");
  }

  const order = await PurchaseOrder.findById(orderId);

  if (!order) throw new Error("Order not found");

  if (order.status === "delivered") {
    return order;
  }

  order.status = status;
  await order.save();

  if (status === "delivered") {
    try {
      await Promise.all(
        order.items.map((item) =>
          axios.patch(
            `${INVENTORY_SERVICE}/api/inventory/${item.itemId}/stock`,
            {
              change: item.quantity,
              type: "add",
              supplierId: order.supplierId,
            },
            {
              headers: { Authorization: token },
            }
          )
        )
      );

      await axios.post(
        `${FINANCE_SERVICE}/api/finance`,
        {
          type: "expense",
          amount: order.totalAmount,
          category: "procurement",
          companyId: order.companyId,
        },
        {
          headers: { Authorization: token },
        }
      );

    } catch (err) {
      console.log("Procurement integration error:", err.message);
      throw new Error("Failed to complete procurement process");
    }
  }

  return order;
};