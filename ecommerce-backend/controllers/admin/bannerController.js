import Banner from "../../models/Banner.js";

export const listBanners = async (req, res, next) => {
  try {
    const { page, position } = req.query;
    const where = {};
    if (page && page !== "all") where.page = page;
    if (position) where.position = position;
    
    const banners = await Banner.findAll({
      where,
      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "DESC"],
      ],
    });
    res.json({ success: true, items: banners });
  } catch (error) {
    next(error);
  }
};

/** Storefront-only: active banners (avoids relying on /api/admin path for public clients). */
export const listStorefrontBanners = async (req, res, next) => {
  try {
    const { page, position } = req.query;
    const where = { isActive: true };
    if (page && page !== "all") where.page = page;
    if (position) where.position = position;

    const banners = await Banner.findAll({
      where,
      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "DESC"],
      ],
    });
    res.json({ success: true, items: banners });
  } catch (error) {
    next(error);
  }
};

export const createBanner = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload.title || (!payload.image && !payload.images?.length)) {
      return res
        .status(400)
        .json({ message: "Title and at least one image are required" });
    }
    // Ensure images array exists, use image as fallback
    if (!payload.images && payload.image) {
      payload.images = [payload.image];
    }
    // Ensure image field exists for backward compat
    if (!payload.image && payload.images?.length) {
      payload.image = payload.images[0];
    }
    // Limit to 5 images
    if (payload.images?.length > 5) {
      payload.images = payload.images.slice(0, 5);
    }
    const banner = await Banner.create(payload);
    res.status(201).json({ success: true, item: banner });
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    const payload = req.body;
    // Ensure images array exists
    if (!payload.images && payload.image) {
      payload.images = [payload.image];
    }
    if (!payload.image && payload.images?.length) {
      payload.image = payload.images[0];
    }
    if (payload.images?.length > 5) {
      payload.images = payload.images.slice(0, 5);
    }
    await banner.update(payload);
    res.json({ success: true, item: banner });
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    await banner.destroy();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

