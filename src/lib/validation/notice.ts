import { z } from "zod";
import { generateUniqueSlug, sanitizedText } from "../utils";
import { MAX_PRICE, MIN_PRICE } from "../constats";

const typeOptions = ["Offer", "Request"] as const;
const statusOptions = ["Published", "Draft"] as const;

export const noticeCreateClientSchema = z.object({
  title: z
    .string()
    .trim()
    .min(50)
    .max(70)
    .transform((title) => sanitizedText(title)),

  text: z
    .string()
    .trim()
    .min(50)
    .max(2000)
    .transform((text) => sanitizedText(text)),
  status: z.enum(statusOptions),
  type: z.enum(typeOptions),
  categoryId: z.string().uuid(),
  price: z.coerce.number().min(0).max(100000000).default(0),
});

export type NoticeCreateClientSchema = z.infer<typeof noticeCreateClientSchema>;

export const noticeCreateServerSchema = noticeCreateClientSchema
  .extend({
    price: z.number().min(0),
    authorId: z.string().min(1),
    slug: z.string().min(50, "Slug must be at least 50 characters").optional(),
  })
  .superRefine(async (data) => {
    data.slug = await generateUniqueSlug(data.title);
  });

export type NoticeCreateServerSchema = z.infer<typeof noticeCreateServerSchema>;

export const noticeUpdateSchema = z.object({
  text: z
    .string()
    .trim()
    .min(50, "Text must be at least 50 characters")
    .max(2000, "Text cannot exceed 2000 characters")
    .transform((text) => sanitizedText(text)),
  categoryId: z.string().uuid(),
  type: z.enum(typeOptions),
  price: z.coerce.number().min(0).max(9999999).default(0),
  status: z.enum(statusOptions),
});
export type NoticeUpdateSchema = z.infer<typeof noticeUpdateSchema>;

export const profileNoticesFilterClientSchema = z.object({
  noticeStatus: z.enum(["All", "Draft", "Published"]).optional(),
  noticeCategory: z.string().optional(),
  noticeType: z.enum(["All", "Offer", "Request"]).default("All"),
  noticeOrderBy: z.enum(["newest", "oldest", "popular", "commented"]),
});

export type ProfileNoticesFilterClientSchema = z.infer<
  typeof profileNoticesFilterClientSchema
>;

export const profileNoticesFilterServerSchema = z.object({
  noticeStatus: z.enum(["Draft", "Published"]).optional(),
  noticeCategory: z.string().uuid().optional(),
  noticeType: z.enum(["Offer", "Request"]).optional(),
  noticeOrderBy: z
    .enum(["newest", "oldest", "popular", "commented"])
    .default("newest"),
});

export type ProfileNoticesFilterServerSchema = z.infer<
  typeof profileNoticesFilterServerSchema
>;

export const noticesFilterClientSchema = z
  .object({
    noticeCategory: z.string().optional(),
    noticeType: z.enum(["All", "Offer", "Request"]).default("All"),
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
    noticeOrderBy: z
      .enum(["newest", "oldest", "popular", "commented"])
      .default("newest"),
    search: z
      .string()
      .max(70, "Max 70 characters")
      .transform((val) => val.trim())
      .optional(),
  })
  .refine((data) => data.noticePriceMin <= data.noticePriceMax, {
    message: "Min price must be ≤ max price",
    path: ["noticePriceMin"],
  });

export type NoticesFilterClientSchema = z.infer<
  typeof noticesFilterClientSchema
>;

export const noticesFilterServerSchema = z
  .object({
    noticeCategory: z.string().uuid().optional(),
    noticeType: z.enum(["Offer", "Request"]).optional(),
    noticePrice: z
      .string()
      .regex(/^\d+,\d+$/, "Invalid price format")
      .refine((val) => {
        const [min, max] = val.split(",").map(Number);
        return Number.isInteger(min) && Number.isInteger(max);
      }, "Prices must be whole numbers")
      .optional(),
    noticeOrderBy: z.enum(["newest", "oldest", "popular", "commented"]),
    search: z.string().max(70).optional(),
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

export type noticesFilterServerSchema = z.infer<
  typeof noticesFilterServerSchema
>;
