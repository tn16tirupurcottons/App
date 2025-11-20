import BrandSetting from "../../models/BrandSetting.js";

const DEFAULT_KEY = "default";
const ALLOWED_KEYS = [
  "logo",
  "favicon",
  "footerLogo",
  "heroBackground",
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "backgroundColor",
  "surfaceColor",
  "textColor",
  "headingFont",
  "bodyFont",
  "headerBackground",
  "containerRadius",
  "themeTokens",
];
const PUBLIC_KEYS = [
  "logo",
  "favicon",
  "footerLogo",
  "heroBackground",
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "backgroundColor",
  "surfaceColor",
  "textColor",
  "headingFont",
  "bodyFont",
  "headerBackground",
  "containerRadius",
  "themeTokens",
];

export const getBrandSettings = async (req, res, next) => {
  try {
    const settings =
      (await BrandSetting.findOne({ where: { settingKey: DEFAULT_KEY } })) ||
      null;
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

export const getPublicBrandSettings = async (req, res, next) => {
  try {
    const record =
      (await BrandSetting.findOne({ where: { settingKey: DEFAULT_KEY } })) ||
      null;
    const settings = record
      ? PUBLIC_KEYS.reduce((acc, key) => {
          acc[key] = record[key];
          return acc;
        }, {})
      : null;
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

export const saveBrandSettings = async (req, res, next) => {
  try {
    const payload = { settingKey: DEFAULT_KEY };
    for (const key of ALLOWED_KEYS) {
      if (req.body[key] !== undefined) {
        payload[key] = req.body[key];
      }
    }
    const [settings] = await BrandSetting.upsert(payload, {
      returning: true,
    });
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

