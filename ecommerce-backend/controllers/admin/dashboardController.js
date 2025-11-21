import { Op } from "sequelize";
import { Product, Category, Order, User } from "../../models/index.js";

export const getAdminOverview = async (req, res, next) => {
  try {
    const [productCount, categoryCount, orderCount, userCount, latestOrdersRaw, lowStockRaw] =
      await Promise.all([
        Product.count(),
        Category.count(),
        Order.count(),
        User.count(),
        Order.findAll({
          limit: 5,
          order: [["createdAt", "DESC"]],
          include: [{ model: User, attributes: ["id", "name", "email"] }],
        }),
        Product.findAll({
          where: { inventory: { [Op.lt]: 10 } },
          order: [["inventory", "ASC"]],
          limit: 5,
        }),
      ]);

    // Convert Sequelize models to plain objects
    const latestOrders = latestOrdersRaw.map(order => order.get({ plain: true }));
    const lowStock = lowStockRaw.map(product => product.get({ plain: true }));

    res.json({
      success: true,
      metrics: {
        productCount,
        categoryCount,
        orderCount,
        userCount,
      },
      latestOrders,
      lowStock,
    });
  } catch (error) {
    next(error);
  }
};

