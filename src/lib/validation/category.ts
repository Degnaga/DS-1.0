import { z } from "zod";
import { MAX_PRICE, MIN_PRICE } from "../constats";

export const categoryNoticesFilterClientSchema = z
  .object({
    search: z
      .string()
      .max(70, "Max 70 characters")
      .transform((val) => val.trim())
      .optional(),
    noticePriceMin: z.coerce
      .number()
      .int("Must be a whole number")
      .min(MIN_PRICE, `Minimum ${MIN_PRICE}`)
      .max(MAX_PRICE, `Maximum ${MAX_PRICE}`)
      .transform((val) => Math.floor(val)),
    noticePriceMax: z.coerce
      .number()
      .int("Must be a whole number")
      .min(MIN_PRICE, `Minimum ${MIN_PRICE}`)
      .max(MAX_PRICE, `Maximum ${MAX_PRICE}`)
      .transform((val) => Math.floor(val)),
    noticeType: z.enum(["All", "Offer", "Request"]).default("All"),
    noticeOrderBy: z
      .enum(["newest", "oldest", "popular", "commented"])
      .default("newest"),
  })
  .refine((data) => data.noticePriceMin <= data.noticePriceMax, {
    message: "Min price must be ≤ max price",
    path: ["noticePriceMin"],
  });

export type CategoryNoticesFilterClientSchema = z.infer<
  typeof categoryNoticesFilterClientSchema
>;

export const categoryNoticesFilterServerSchema = z
  .object({
    search: z.string().max(70).optional(),
    noticePrice: z
      .string()
      .regex(/^\d+,\d+$/, "Invalid price format")
      .refine((val) => {
        const [min, max] = val.split(",").map(Number);
        return Number.isInteger(min) && Number.isInteger(max);
      }, "Prices must be whole numbers")
      .optional(),
    noticeType: z.enum(["Offer", "Request"]).optional(),
    noticeOrderBy: z.enum(["newest", "oldest", "popular", "commented"]),
  })
  .refine(
    (data) => {
      if (!data.noticePrice) return true;
      const [min, max] = data.noticePrice.split(",").map(Number);
      return min <= max;
    },
    {
      message: "Min price must be ≤ max price",
      path: ["noticePrice"],
    }
  );

export type CategoryNoticesFilterServerSchema = z.infer<
  typeof categoryNoticesFilterServerSchema
>;
