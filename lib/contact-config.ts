import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { defaultContactConfig, defaultPhones, defaultEmails } from "@/lib/contact-info";
import type { ContactConfigRecord } from "@/lib/contact-info";

export type { ContactPhoneRecord, ContactEmailRecord, ContactConfigRecord } from "@/lib/contact-info";
export {
  defaultContactConfig,
  defaultPhones,
  defaultEmails,
  defaultPublicContactConfig,
  formatPhoneHref,
  formatWhatsAppHref,
  formatMailtoHref,
  formatBusinessHours,
  formatBusinessDays,
} from "@/lib/contact-info";

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
