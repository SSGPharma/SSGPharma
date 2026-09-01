import { z } from "zod";

const imageReferenceSchema = z.string().trim().min(1, "Image reference cannot be empty").max(4000000, "Image reference is too long");
const nullableImageReferenceSchema = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  return value;
}, z.union([imageReferenceSchema, z.null()])).optional();

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(160, "Name is too long"),
  slug: z.string().trim().min(1, "Slug is required").max(180, "Slug is too long"),
  categoryId: z.string().trim().min(1, "Category is required"),
  manufacturer: z.string().trim().max(160, "Manufacturer is too long").optional(),
  isActive: z.boolean().default(true),
  pricePaise: z.number().int().min(0, "Price must be non-negative"),
  mrpPaise: z.number().int().min(0).optional().nullable(),
  priceSuffix: z.string().trim().max(50, "Suffix is too long").optional().nullable(),
  mrpSuffix: z.string().trim().max(50, "Suffix is too long").optional().nullable(),
  dosage: z.string().trim().max(120, "Dosage is too long").optional(),
  packSize: z.string().trim().max(120, "Pack size is too long").optional(),
  salts: z.string().trim().max(4000, "Salts field is too long").optional(),
  description: z.string().trim().max(12000, "Description is too long").optional(),
  keyBenefits: z.string().trim().max(8000, "Key benefits are too long").optional(),
  goodToKnow: z.string().trim().max(8000, "Good to know is too long").optional(),
  dietType: z.string().trim().max(8000, "Diet type is too long").optional(),
  productForm: z.string().trim().max(120, "Product form is too long").optional(),
  allergiesInformation: z.string().trim().max(8000, "Allergies information is too long").optional(),
  directionForUse: z.string().trim().max(8000, "Direction for use is too long").optional(),
  safetyInformation: z.string().trim().max(8000, "Safety information is too long").optional(),
  schema: z.string().trim().max(8000, "Schema is too long").optional(),
  specialBenefitSchemes: z.string().trim().max(8000, "Special schemes are too long").optional(),
  faqs: z.string().trim().max(12000, "FAQs are too long").optional(),
  imageUrl1: nullableImageReferenceSchema,
  imageUrl2: nullableImageReferenceSchema,
  imageUrl3: nullableImageReferenceSchema,
  moleculeIds: z.array(z.string()).optional().default([]),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
