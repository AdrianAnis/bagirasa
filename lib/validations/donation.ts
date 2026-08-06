import { z } from "zod";

export const FOOD_TYPES = [
  "makanan_berat",
  "makanan_ringan",
  "minuman",
  "roti_kue",
  "buah_sayur",
  "lainnya",
] as const;

export type FoodType = (typeof FOOD_TYPES)[number];

export const FOOD_TYPE_LABEL: Record<FoodType, string> = {
  makanan_berat: "Makanan berat",
  makanan_ringan: "Makanan ringan",
  minuman: "Minuman",
  roti_kue: "Roti & kue",
  buah_sayur: "Buah & sayur",
  lainnya: "Lainnya",
};

export const MAX_SHELF_LIFE_HOURS = 168;

const foodItemSchema = z.object({
  name: z.string().trim().min(3, "Nama makanan minimal 3 karakter"),
  foodType: z.enum(FOOD_TYPES),
  shelfLifeHours: z
    .number("Ketahanan wajib diisi")
    .int("Harus bilangan bulat")
    .min(1, "Minimal 1 jam")
    .max(MAX_SHELF_LIFE_HOURS, "Maksimal 168 jam (7 hari)"),
  isHalal: z.boolean(),
  ingredients: z.string().trim().min(3, "Bahan yang digunakan wajib diisi"),
  allergens: z.array(z.string()),
  quantity: z
    .number("Kuantitas wajib diisi")
    .int("Harus bilangan bulat")
    .min(1, "Minimal 1"),
  unit: z.string().trim().min(1, "Satuan wajib diisi"),
  servings: z
    .number("Estimasi porsi wajib diisi")
    .int("Harus bilangan bulat")
    .min(1, "Minimal 1 porsi"),
});

export const donationCreateSchema = z.object({
  notes: z.string().trim().max(500, "Catatan maksimal 500 karakter").optional(),
  items: z.array(foodItemSchema).min(1, "Minimal satu item makanan"),
});

export type DonationCreateInput = z.infer<typeof donationCreateSchema>;
export type FoodItemInput = z.infer<typeof foodItemSchema>;
