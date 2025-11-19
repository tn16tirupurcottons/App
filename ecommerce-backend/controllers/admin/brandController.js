import BrandSetting from "../../models/BrandSetting.js";

const DEFAULT_KEY = "default";

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

export const saveBrandSettings = async (req, res, next) => {
  try {
    const payload = { ...req.body, settingKey: DEFAULT_KEY };
    const [settings] = await BrandSetting.upsert(payload, {
      returning: true,
    });
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

