import { z } from "zod";

export const createContactPhoneSchema = z.object({
  value: z.string().trim().min(5, "Phone number is too short").max(40, "Phone number is too long").regex(/^\+?[0-9\s\-()]+$/, "Invalid phone number format"),
  purpose: z.enum(["sales", "support", "procurement", "emergency"]),
  description: z.string().trim().max(200, "Description is too long").optional(),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(0).max(999).default(0),
});

export const createContactEmailSchema = z.object({
  value: z.string().trim().email("Invalid email address").max(254, "Email is too long"),
  type: z.enum(["general", "procurement", "support", "sales", "inquiry_recipient"]),
  description: z.string().trim().max(200, "Description is too long").optional(),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(0).max(999).default(0),
});

export const updateContactConfigSchema = z.object({
  companyName: z.string().trim().max(160).optional(),
  businessType: z.string().trim().max(120).optional(),
  officeAddress: z.string().trim().max(400).optional(),
  officeCity: z.string().trim().max(120).optional(),
  officeState: z.string().trim().max(120).optional(),
  officeZipCode: z.string().trim().max(24).optional(),
  businessHoursStart: z.string().optional(),
  businessHoursEnd: z.string().optional(),
  businessDaysMonFri: z.boolean().optional(),
  businessDaysSat: z.boolean().optional(),
  businessDaysSun: z.boolean().optional(),
});

export type CreateContactPhoneInput = z.infer<typeof createContactPhoneSchema>;
export type CreateContactEmailInput = z.infer<typeof createContactEmailSchema>;
export type UpdateContactConfigInput = z.infer<typeof updateContactConfigSchema>;

export const inquiryTypeValues = ["general", "product", "partnership", "wholesale", "complaint", "other"] as const;

export const createInquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email address").max(254, "Email is too long"),
  phone: z
    .string()
    .trim()
    .max(40, "Phone number is too long")
    .regex(/^(\+?[0-9\s\-()]{10,20})?$/, "Please enter a valid phone number")
    .optional(),
  company: z.string().trim().max(200, "Company name is too long").optional(),
  inquiryType: z.enum(inquiryTypeValues).default("general"),
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(200, "Subject is too long"),
  message: z.string().trim().min(20, "Message must be at least 20 characters").max(2000, "Message is too long"),
  /** Honeypot — real users never fill this in. */
  website: z.string().max(0).optional(),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
