import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
  serial_number: z
    .string()
    .min(14, "14 Characters Required")
    .transform((val) => val.toUpperCase())
    .refine((val) => /^[A-Z0-9]+$/.test(val), {
      message: "Only uppercase letters and numbers allowed",
    }),
  make: z.string().nullable(),
  model: z.string().nullable(),
  price: z
    .number()
    .min(0, "Must be a positive number")
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(String(val)), {
      message: "Max 2 decimal places",
    }),
  date_sold: z.date().optional(),
  date_entered: z.date().optional(),
  repair_status: z.enum(["In Progress", "Complete"]),
  sale_status: z.enum([
    "Not Yet Posted",
    "Awaiting Sale",
    "Sold Awaiting Delivery",
    "Delivered",
  ]),
  length: z
    .number()
    .min(0, "Must be a positive number")
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(String(val)), {
      message: "Max 2 decimal places",
    }),
  width: z
    .number()
    .min(0, "Must be a positive number")
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(String(val)), {
      message: "Max 2 decimal places",
    }),
  note: z.string().optional().nullable(),
  images: z.array(z.string().url()).optional(),
});

export type ProductFormData = z.infer<typeof ProductSchema>;
