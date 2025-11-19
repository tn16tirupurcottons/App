import Banner from "../../models/Banner.js";

export const listBanners = async (req, res, next) => {
  try {
    const banners = await Banner.findAll({
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
    if (!payload.title || !payload.image) {
      return res
        .status(400)
        .json({ message: "Title and image are required for banners" });
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
    await banner.update(req.body);
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

