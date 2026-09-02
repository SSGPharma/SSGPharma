import { z } from "zod";

const imageReferenceSchema = z.string().trim().min(1, "Image reference cannot be empty").max(10000000, "Image reference is too long");
const nullableImageReferenceSchema = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  return value;
}, z.union([imageReferenceSchema, z.null()])).optional();

export const createMoleculeSchema = z.object({
  name: z.string().trim().min(1, "Molecule name is required").max(160, "Molecule name is too long"),
  slug: z.string().trim().min(1, "Slug is required").max(180, "Slug is too long"),
  synonyms: z.string().trim().max(2000, "Synonyms field is too long").optional(),
  imageUrl: nullableImageReferenceSchema,
  isPublished: z.boolean().default(true),
  overview: z.string().trim().max(12000, "Overview is too long").optional(),
  backgroundAndApproval: z.string().trim().max(12000, "Background and approval is too long").optional(),
  uses: z.string().trim().max(12000, "Uses section is too long").optional(),
  administration: z.string().trim().max(12000, "Administration section is too long").optional(),
  sideEffects: z.string().trim().max(12000, "Side effects section is too long").optional(),
  warnings: z.string().trim().max(12000, "Warnings section is too long").optional(),
  precautions: z.string().trim().max(12000, "Precautions section is too long").optional(),
  expertTips: z.string().trim().max(12000, "Expert tips section is too long").optional(),
  faqs: z.string().trim().max(12000, "FAQs section is too long").optional(),
  references: z.string().trim().max(12000, "References section is too long").optional(),
});

export const updateMoleculeSchema = createMoleculeSchema.partial();

export type CreateMoleculeInput = z.infer<typeof createMoleculeSchema>;
export type UpdateMoleculeInput = z.infer<typeof updateMoleculeSchema>;
