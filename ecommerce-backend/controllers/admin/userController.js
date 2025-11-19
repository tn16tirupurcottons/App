import { Op, fn, col } from "sequelize";
import { User, Order } from "../../models/index.js";

export const listUsers = async (req, res, next) => {
  try {
    const { search = "", role, includeOrders } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const users = await User.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    let statsMap = new Map();
    let lastOrderMap = new Map();

    if (includeOrders === "true") {
      const stats = await Order.findAll({
        attributes: [
          "userId",
          [fn("COUNT", col("Order.id")), "orderCount"],
          [fn("SUM", col("Order.total")), "lifetimeValue"],
        ],
        group: ["userId"],
        raw: true,
      });

      const lastOrders = await Order.findAll({
        attributes: [
          "userId",
          "shippingCity",
          "shippingState",
          "shippingAddress",
          "shippingZip",
          "shippingCountry",
          "createdAt",
          "total",
        ],
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      statsMap = new Map(stats.map((row) => [row.userId, row]));

      lastOrderMap = new Map();
      for (const order of lastOrders) {
        if (!lastOrderMap.has(order.userId)) {
          lastOrderMap.set(order.userId, order);
        }
      }
    }

    const enriched = users.map((user) => {
      const stats = statsMap.get(user.id) || {};
      const lastOrder = lastOrderMap.get(user.id) || null;
      return {
        ...user.toJSON(),
        orderCount: Number(stats.orderCount || 0),
        lifetimeValue: Number(stats.lifetimeValue || 0),
        lastOrder,
      };
    });

    res.json({ success: true, items: enriched });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.update({ role });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.destroy();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

