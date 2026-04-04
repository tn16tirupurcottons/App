import Banner from "../../models/Banner.js";
import { Category } from "../../models/index.js";

export const listBanners = async (req, res, next) => {
  try {
    const { page, position, segment, categorySlug } = req.query;
    const where = {};
    if (page && page !== "all") where.page = page;
    if (position) where.position = position;
    if (segment && segment !== "all") where.segment = segment;

    const include = [];
    if (categorySlug) {
      include.push({
        model: Category,
        where: { slug: categorySlug },
        required: true,
        attributes: ["id", "name", "slug"],
      });
    } else {
      include.push({
        model: Category,
        required: false,
        attributes: ["id", "name", "slug"],
      });
    }

    console.log("[BANNER] listBanners query:", { page, position, segment, categorySlug, where });

    const banners = await Banner.findAll({
      where,
      include,
      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "DESC"],
      ],
    });
    
    console.log(`[BANNER] Found ${banners.length} banners`);
    res.json({ success: true, items: banners });
  } catch (error) {
    console.error("[BANNER] Error listing banners:", error.message);
    next(error);
  }
};

/** Storefront-only: active banners (avoids relying on /api/admin path for public clients). */
export const listStorefrontBanners = async (req, res, next) => {
  try {
    const { page, position, segment, categorySlug } = req.query;
    const where = { isActive: true };
    if (page && page !== "all") where.page = page;
    if (position) where.position = position;
    if (segment && segment !== "all") where.segment = segment;

    const include = [{
      model: Category,
      required: false,
      attributes: ["id", "name", "slug"],
    }];

    if (categorySlug) {
      include[0].required = true;
      include[0].where = { slug: categorySlug };
    }

    console.log("[BANNER STOREFRONT] Fetching active banners:", { page, position, segment, categorySlug });

    const banners = await Banner.findAll({
      where,
      include,
      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "DESC"],
      ],
    });
    
    console.log(`[BANNER STOREFRONT] Found ${banners.length} active banners`);
    res.json({ success: true, items: banners });
  } catch (error) {
    console.error("[BANNER STOREFRONT] Error:", error.message);
    next(error);
  }
};

export const createBanner = async (req, res, next) => {
  try {
    console.log("[BANNER CREATE] Request body:", JSON.stringify(req.body, null, 2));
    console.log("[BANNER CREATE] Files received:", req.files?.length || 0);
    
    const payload = req.body;
    
    // Validate required fields
    if (!payload.title) {
      console.warn("[BANNER CREATE] Missing title");
      return res.status(400).json({ message: "Title is required" });
    }
    
    // Handle images from multiple sources
    let images = [];
    
    // 1. Direct images array in payload (from admin form)
    if (payload.images && Array.isArray(payload.images)) {
      images = payload.images.filter((img) => img && String(img).trim());
      console.log(`[BANNER CREATE] Got ${images.length} images from payload.images`);
    }
    
    // 2. Fallback to single image
    if (images.length === 0 && payload.image && String(payload.image).trim()) {
      images = [payload.image];
      console.log(`[BANNER CREATE] Using fallback image: ${payload.image}`);
    }
    
    // Validate that we have at least one image
    if (images.length === 0) {
      console.warn("[BANNER CREATE] No valid images provided");
      return res.status(400).json({ message: "At least one image is required" });
    }
    
    // Limit to 5 images
    if (images.length > 5) {
      images = images.slice(0, 5);
      console.log(`[BANNER CREATE] Limited to 5 images`);
    }
    
    // Build final payload
    const bannerPayload = {
      title: payload.title,
      subtitle: payload.subtitle || "",
      images: images,
      image: images[0], // Keep first as primary for backward compat
      ctaLabel: payload.ctaLabel || "Shop Now",
      ctaLink: payload.ctaLink || "/catalog",
      segment: payload.segment || "default",
      page: payload.page || "home",
      position: payload.position || "hero",
      categoryId: payload.categoryId || null,
      displayOrder: Number(payload.displayOrder) || 0,
      isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
    };
    
    console.log(`[BANNER CREATE] Creating banner with payload:`, JSON.stringify(bannerPayload, null, 2));
    
    const banner = await Banner.create(bannerPayload);
    
    console.log(`[BANNER CREATE] ✅ Banner created with ID: ${banner.id}`);
    res.status(201).json({ success: true, item: banner });
  } catch (error) {
    console.error("[BANNER CREATE] ❌ Error:", error.message);
    next(error);
  }
};

export const updateBanner = async (req, res, next) => {
  try {
    const bannerId = req.params.id;
    console.log(`[BANNER UPDATE] Fetching banner ${bannerId}`);
    
    const banner = await Banner.findByPk(bannerId);
    if (!banner) {
      console.warn(`[BANNER UPDATE] Banner ${bannerId} not found`);
      return res.status(404).json({ message: "Banner not found" });
    }
    
    const payload = req.body;
    console.log(`[BANNER UPDATE] Update payload:`, JSON.stringify(payload, null, 2));
    
    // Handle images
    let images = [];
    
    if (payload.images && Array.isArray(payload.images)) {
      images = payload.images.filter((img) => img && String(img).trim());
      console.log(`[BANNER UPDATE] Got ${images.length} images from payload`);
    }
    
    if (images.length === 0 && payload.image && String(payload.image).trim()) {
      images = [payload.image];
      console.log(`[BANNER UPDATE] Using fallback image: ${payload.image}`);
    }
    
    // If no images provided in update, keep existing images
    if (images.length === 0) {
      images = banner.images || (banner.image ? [banner.image] : []);
      console.log(`[BANNER UPDATE] Keeping existing images: ${images.length}`);
    }
    
    // Limit to 5 images
    if (images.length > 5) {
      images = images.slice(0, 5);
    }
    
    // Build update payload
    const updateData = {
      title: payload.title || banner.title,
      subtitle: payload.subtitle !== undefined ? payload.subtitle : banner.subtitle,
      images: images,
      image: images[0] || banner.image,
      ctaLabel: payload.ctaLabel !== undefined ? payload.ctaLabel : banner.ctaLabel,
      ctaLink: payload.ctaLink !== undefined ? payload.ctaLink : banner.ctaLink,
      segment: payload.segment || banner.segment,
      page: payload.page || banner.page,
      position: payload.position || banner.position,
      categoryId: payload.categoryId !== undefined ? payload.categoryId : banner.categoryId,
      displayOrder: payload.displayOrder !== undefined ? Number(payload.displayOrder) : banner.displayOrder,
      isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : banner.isActive,
    };
    
    console.log(`[BANNER UPDATE] Applying update:`, JSON.stringify(updateData, null, 2));
    
    await banner.update(updateData);
    
    console.log(`[BANNER UPDATE] ✅ Banner ${bannerId} updated successfully`);
    res.json({ success: true, item: banner });
  } catch (error) {
    console.error(`[BANNER UPDATE] ❌ Error:`, error.message);
    next(error);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const bannerId = req.params.id;
    console.log(`[BANNER DELETE] Deleting banner ${bannerId}`);
    
    const banner = await Banner.findByPk(bannerId);
    if (!banner) {
      console.warn(`[BANNER DELETE] Banner ${bannerId} not found`);
      return res.status(404).json({ message: "Banner not found" });
    }
    
    await banner.destroy();
    
    console.log(`[BANNER DELETE] ✅ Banner ${bannerId} deleted`);
    res.json({ success: true });
  } catch (error) {
    console.error(`[BANNER DELETE] ❌ Error:`, error.message);
    next(error);
  }
};

