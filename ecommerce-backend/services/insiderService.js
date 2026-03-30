import { User, Order } from "../models/index.js";

const INSIDER_ORDER_THRESHOLD = 5;
const INSIDER_SPEND_THRESHOLD = 5000;

/**
 * Automatically upgrades a user to TNEXT Insider when they reach:
 * - total orders >= 5 OR
 * - total spend >= 5000
 */
export const ensureInsiderUpgraded = async (userId, { transaction } = {}) => {
  const user = await User.findByPk(userId, { transaction });
  if (!user) return null;

  if (user.is_insider) return user;

  const [orderCount, lifetimeValue] = await Promise.all([
    Order.count({ where: { userId }, transaction }),
    Order.sum("total", { where: { userId }, transaction }),
  ]);

  const totalSpent = Number(lifetimeValue || 0);

  if (
    Number(orderCount || 0) >= INSIDER_ORDER_THRESHOLD ||
    totalSpent >= INSIDER_SPEND_THRESHOLD
  ) {
    user.is_insider = true;
    user.insider_since = new Date();
    await user.save({ transaction });
    return user;
  }

  return user;
};

export const toggleInsiderStatus = async (userId, nextIsInsider) => {
  const user = await User.findByPk(userId);
  if (!user) return null;

  user.is_insider = Boolean(nextIsInsider);
  user.insider_since = user.is_insider ? new Date() : null;
  await user.save();
  return user;
};

