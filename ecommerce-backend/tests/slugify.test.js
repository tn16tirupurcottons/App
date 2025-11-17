import { describe, expect, it } from "vitest";
import slugify from "../utils/slugify.js";

describe("slugify utility", () => {
  it("creates kebab-case slugs", () => {
    expect(slugify("TN16 Cotton Drop")).toBe("tn16-cotton-drop");
  });

  it("removes special characters", () => {
    expect(slugify("Limited! Edition (2025)")).toBe("limited-edition-2025");
  });
});

