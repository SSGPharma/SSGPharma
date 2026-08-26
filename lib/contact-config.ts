import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type ContactPhoneRecord = {
  id: string;
  value: string;
  purpose: string;
  description: string | null;
  isActive: boolean;
  priority: number;
};

export type ContactEmailRecord = {
  id: string;
  value: string;
  type: string;
  description: string | null;
  isActive: boolean;
  priority: number;
};

export type ContactConfigRecord = {
  id: string;
  companyName: string;
  businessType: string;
  officeAddress: string | null;
  officeCity: string | null;
  officeState: string | null;
  officeZipCode: string | null;
  businessHoursStart: string | null;
  businessHoursEnd: string | null;
  businessDaysMonFri: boolean;
  businessDaysSat: boolean;
  businessDaysSun: boolean;
  phones: ContactPhoneRecord[];
  emails: ContactEmailRecord[];
};

export const defaultContactConfig = {
  companyName: "SSG Pharma",
  businessType: "Pharmaceutical Wholesaler",
  officeAddress: "B-28, SUSHANT VYAPAR KENDER, Sushant Lok Phase 1",
  officeCity: "Gurugram",
  officeState: "Haryana",
  officeZipCode: "122002",
  businessHoursStart: "09:00",
  businessHoursEnd: "18:00",
  businessDaysMonFri: true,
  businessDaysSat: true,
  businessDaysSun: false,
} as const;

export const defaultPhones = [
  {
    value: "+91 93554 74600",
    purpose: "procurement",
    description: "Neelam",
    isActive: true,
    priority: 100,
  },
  {
    value: "+91 88601 08519",
    purpose: "sales",
    description: "Sales desk",
    isActive: true,
    priority: 80,
  },
  {
    value: "+91 97116 80234",
    purpose: "emergency",
    description: "Emergency escalation",
    isActive: true,
    priority: 60,
  },
] as const;

export const defaultEmails = [
  {
    value: "SSGPHARMAONLINE@GMAIL.COM",
    type: "general",
    description: "General enquiries",
    isActive: true,
    priority: 100,
  },
  {
    value: "SSGPHARMAONLINE@GMAIL.COM",
    type: "inquiry_recipient",
    description: "Quote requests",
    isActive: true,
    priority: 100,
  },
] as const;

export const defaultPublicContactConfig: ContactConfigRecord = {
  id: "default-contact-config",
  ...defaultContactConfig,
  phones: defaultPhones.map((phone, index) => ({
    id: `default-phone-${index + 1}`,
    value: phone.value,
    purpose: phone.purpose,
    description: phone.description,
    isActive: phone.isActive,
    priority: phone.priority,
  })),
  emails: defaultEmails.map((email, index) => ({
    id: `default-email-${index + 1}`,
    value: email.value.toLowerCase(),
    type: email.type,
    description: email.description,
    isActive: email.isActive,
    priority: email.priority,
  })),
};

export const ensureContactConfig = cache(async function ensureContactConfig() {
  let config = await prisma.contactConfig.findFirst();
  const createdNow = config === null;

  if (!config) {
    config = await prisma.contactConfig.create({
      data: defaultContactConfig,
    });
  } else {
    config = await prisma.contactConfig.update({
      where: { id: config.id },
      data: {
        officeAddress: config.officeAddress || defaultContactConfig.officeAddress,
        officeCity: config.officeCity || defaultContactConfig.officeCity,
        officeState: config.officeState || defaultContactConfig.officeState,
        officeZipCode: config.officeZipCode || defaultContactConfig.officeZipCode,
        businessHoursStart: config.businessHoursStart || defaultContactConfig.businessHoursStart,
        businessHoursEnd: config.businessHoursEnd || defaultContactConfig.businessHoursEnd,
      },
    });
  }

  const existingPhones = await prisma.contactPhone.findMany({
    where: { configId: config.id },
    take: 100,
    select: {
      id: true,
      value: true,
      purpose: true,
    },
  });
  const phoneKeys = new Set<string>();
  for (const phone of existingPhones) {
    const key = `${phone.value}|${phone.purpose}`;
    if (phoneKeys.has(key)) {
      await prisma.contactPhone.delete({ where: { id: phone.id } });
    } else {
      phoneKeys.add(key);
    }
  }

  if (createdNow) {
    await prisma.contactPhone.createMany({
      data: defaultPhones.map((phone) => ({
        configId: config.id,
        ...phone,
      })),
    });
  }

  const existingEmails = await prisma.contactEmail.findMany({
    where: { configId: config.id },
    take: 100,
    select: {
      id: true,
      value: true,
      type: true,
    },
  });
  const emailKeys = new Set<string>();
  for (const email of existingEmails) {
    const key = `${email.value}|${email.type}`;
    if (emailKeys.has(key)) {
      await prisma.contactEmail.delete({ where: { id: email.id } });
    } else {
      emailKeys.add(key);
    }
  }

  if (createdNow) {
    await prisma.contactEmail.createMany({
      data: defaultEmails.map((email) => ({
        configId: config.id,
        ...email,
      })),
    });
  }

  return config;
});

const getActiveContactConfig = cache(async function getActiveContactConfig(): Promise<ContactConfigRecord> {
  const config = await ensureContactConfig();
  return prisma.contactConfig.findUniqueOrThrow({
    where: { id: config.id },
    include: {
      phones: {
        where: { isActive: true },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      },
      emails: {
        where: { isActive: true },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      },
    },
  });
});

const getAllContactConfig = cache(async function getAllContactConfig(): Promise<ContactConfigRecord> {
  const config = await ensureContactConfig();
  return prisma.contactConfig.findUniqueOrThrow({
    where: { id: config.id },
    include: {
      phones: {
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      },
      emails: {
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      },
    },
  });
});

export async function getContactConfig(options?: { includeInactive?: boolean }): Promise<ContactConfigRecord> {
  return options?.includeInactive ? getAllContactConfig() : getActiveContactConfig();
}

export function formatPhoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function formatWhatsAppHref(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

export function formatMailtoHref(email: string) {
  return `mailto:${email}`;
}

export function formatBusinessHours(config: Pick<ContactConfigRecord, "businessHoursStart" | "businessHoursEnd">) {
  if (!config.businessHoursStart || !config.businessHoursEnd) return "Hours not set";

  const [startHour, startMinute] = config.businessHoursStart.split(":").map(Number);
  const [endHour, endMinute] = config.businessHoursEnd.split(":").map(Number);
  if ([startHour, startMinute, endHour, endMinute].some((value) => Number.isNaN(value) || value === undefined)) {
    return "Hours not set";
  }

  const formatTime = (hour: number, minute: number) => {
    const h = String(hour).padStart(2, "0");
    const m = String(minute).padStart(2, "0");
    return `${h}:${m}`;
  };

  return `${formatTime(startHour ?? 0, startMinute ?? 0)} - ${formatTime(endHour ?? 0, endMinute ?? 0)}`;
}

export function formatBusinessDays(config: Pick<ContactConfigRecord, "businessDaysMonFri" | "businessDaysSat" | "businessDaysSun">) {
  const days: string[] = [];
  if (config.businessDaysMonFri) days.push("Mon-Fri");
  if (config.businessDaysSat) days.push("Sat");
  if (config.businessDaysSun) days.push("Sun");
  return days.length > 0 ? days.join(", ") : "Days not set";
}
