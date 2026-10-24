import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createInquirySchema } from "@/lib/validators/contact";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recentSubmissions = new Map<string, number[]>();

function isRateLimited(key: string) {
  const now = Date.now();
  const hits = (recentSubmissions.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    recentSubmissions.set(key, hits);
    return true;
  }
  hits.push(now);
  recentSubmissions.set(key, hits);
  return false;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const parsed = createInquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid submission" }, { status: 400 });
    }

    const { name, email, phone, company, inquiryType, subject, message } = parsed.data;
    const extraFields: Record<string, string | undefined> = {};
    const raw = parsed.data as Record<string, unknown>;
    if (typeof raw.quantity === "string" && raw.quantity.trim()) extraFields.quantity = raw.quantity.trim();
    if (typeof raw.urgency === "string" && raw.urgency.trim()) extraFields.urgency = raw.urgency.trim();
    if (typeof raw.delivery === "string" && raw.delivery.trim()) extraFields.delivery = raw.delivery.trim();
    if (typeof raw.dosage === "string" && raw.dosage.trim()) extraFields.dosage = raw.dosage.trim();

    const fullMessageParts = [`Subject: ${subject}`, company ? `Company: ${company}` : null, ""];
    if (extraFields.quantity) fullMessageParts.push(`Quantity: ${extraFields.quantity}`);
    if (extraFields.urgency) fullMessageParts.push(`Urgency: ${extraFields.urgency}`);
    if (extraFields.delivery) fullMessageParts.push(`Delivery: ${extraFields.delivery}`);
    if (extraFields.dosage) fullMessageParts.push(`Dosage: ${extraFields.dosage}`);
    fullMessageParts.push("", message);
    const fullMessage = fullMessageParts.filter((line) => line !== null).join("\n");

    await prisma.inquiry.create({
      data: { name, email, phone: phone || null, message: fullMessage, inquiryType },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Error saving inquiry:", error);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }
}
