import AppImage from "../models/AppImage.js";

export const listPublicImages = async (req, res, next) => {
  try {
    const rows = await AppImage.findAll({
      where: { isActive: true },
      order: [["key", "ASC"]],
    });
    res.json({ success: true, items: rows });
  } catch (err) {
    next(err);
  }
};

export const getImageByKey = async (req, res, next) => {
  try {
    const key = decodeURIComponent(req.params.key || "");
    if (!key) {
      return res.status(400).json({ message: "key is required" });
    }
    const row = await AppImage.findOne({
      where: { key, isActive: true },
    });
    if (!row) {
      return res.status(404).json({ message: "Image not found" });
    }
    res.json({ success: true, item: row });
  } catch (err) {
    next(err);
  }
};

export const listAdminImages = async (req, res, next) => {
  try {
    const rows = await AppImage.findAll({
      order: [["key", "ASC"]],
    });
    res.json({ success: true, items: rows });
  } catch (err) {
    next(err);
  }
};

export const upsertImageByKey = async (req, res, next) => {
  try {
    const key = decodeURIComponent(req.params.key || "");
    const { image_url, label, description, is_active: isActiveBody } = req.body || {};
    if (!key) {
      return res.status(400).json({ message: "key is required" });
    }
    if (!image_url || typeof image_url !== "string" || !image_url.trim()) {
      return res.status(400).json({ message: "image_url is required" });
    }

    const existing = await AppImage.findOne({ where: { key } });
    if (existing) {
      await existing.update({
        image_url: image_url.trim(),
        ...(label !== undefined && { label: String(label).slice(0, 255) }),
        ...(description !== undefined && { description }),
        ...(typeof isActiveBody === "boolean" && { isActive: isActiveBody }),
      });
      return res.json({ success: true, item: existing });
    }

    const created = await AppImage.create({
      key,
      label: (label && String(label).slice(0, 255)) || key,
      description: description || "",
      image_url: image_url.trim(),
      isActive: typeof isActiveBody === "boolean" ? isActiveBody : true,
    });
    res.status(201).json({ success: true, item: created });
  } catch (err) {
    next(err);
  }
};

export const createImage = async (req, res, next) => {
  try {
    const { key, label, description, image_url, is_active: isActiveBody } = req.body || {};
    if (!key || !image_url) {
      return res.status(400).json({ message: "key and image_url are required" });
    }
    const row = await AppImage.create({
      key: String(key).trim().slice(0, 100),
      label: (label && String(label).slice(0, 255)) || key,
      description: description || "",
      image_url: String(image_url).trim(),
      isActive: typeof isActiveBody === "boolean" ? isActiveBody : true,
    });
    res.status(201).json({ success: true, item: row });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "An image with this key already exists" });
    }
    next(err);
  }
};
