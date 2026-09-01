"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { Fragment } from "react";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Boxes,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  FlaskConical,
  FolderTree,
  History,
  Inbox,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Save,
  Search,
  Settings,
  LogOut,
  Trash2,
} from "lucide-react";
import { ContactConfigManager } from "@/components/admin/contact-config-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ManagedImage } from "@/components/web/managed-image";
import type { ContactConfigRecord } from "@/lib/contact-config";
import { slugify } from "@/lib/slug";

type TabId = "dashboard" | "products" | "molecules" | "categories" | "contacts" | "settings";
type LoadState = "idle" | "loading" | "ready" | "error";
type SubmitMode = "save" | "save-add-another" | "save-continue";
type Banner = { type: "success" | "error"; text: string } | null;

type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  category: CategoryRecord | null;
  manufacturer: string | null;
  isActive: boolean;
  pricePaise: number;
  mrpPaise: number | null;
  priceSuffix: string | null;
  mrpSuffix: string | null;
  dosage: string | null;
  packSize: string | null;
  salts: string | null;
  description: string | null;
  keyBenefits: string | null;
  goodToKnow: string | null;
  dietType: string | null;
  productForm: string | null;
  allergiesInformation: string | null;
  directionForUse: string | null;
  safetyInformation: string | null;
  schema: string | null;
  specialBenefitSchemes: string | null;
  faqs: string | null;
  imageUrl1: string | null;
  imageUrl2: string | null;
  imageUrl3: string | null;
  createdAt: string;
  updatedAt: string;
  molecules?: Array<{ moleculeId: string }>;
};

type MoleculeRecord = {
  id: string;
  name: string;
  slug: string;
  synonyms: string | null;
  imageUrl: string | null;
  isPublished: boolean;
  overview: string | null;
  backgroundAndApproval: string | null;
  uses: string | null;
  administration: string | null;
  sideEffects: string | null;
  warnings: string | null;
  precautions: string | null;
  expertTips: string | null;
  faqs: string | null;
  references: string | null;
  createdAt: string;
  updatedAt: string;
};

type ContactRecord = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

type ProductFormState = {
  name: string;
  slug: string;
  categoryId: string;
  manufacturer: string;
  isActive: boolean;
  price: string;
  mrp: string;
  priceSuffix: string;
  mrpSuffix: string;
  dosage: string;
  packSize: string;
  salts: string;
  moleculeIds: string[];
  description: string;
  keyBenefits: string;
  goodToKnow: string;
  dietType: string;
  productForm: string;
  allergiesInformation: string;
  directionForUse: string;
  safetyInformation: string;
  schema: string;
  specialBenefitSchemes: string;
  faqs: string;
  imageUrl1: string;
  imageUrl2: string;
  imageUrl3: string;
  clearImage1: boolean;
  clearImage2: boolean;
  clearImage3: boolean;
};

type MoleculeFormState = {
  name: string;
  slug: string;
  synonyms: string;
  imageUrl: string;
  clearImage: boolean;
  isPublished: boolean;
  overview: string;
  backgroundAndApproval: string;
  uses: string;
  administration: string;
  sideEffects: string;
  warnings: string;
  precautions: string;
  expertTips: string;
  faqs: string;
  references: string;
};

type CategoryFormState = {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
};

type PasswordVisibility = {
  current: boolean;
  next: boolean;
  confirm: boolean;
};

type HistoryState = {
  kind: "product" | "molecule";
  name: string;
  createdAt: string;
  updatedAt: string;
} | null;

type RecentAction = {
  key: string;
  kind: "product" | "molecule";
  id: string;
  name: string;
  slug: string;
  updatedAt: string;
};

const tabs: Array<{ id: TabId; label: string; icon: typeof Boxes }> = [
  { id: "dashboard", label: "Dashboard", icon: Boxes },
  { id: "products", label: "Products", icon: Boxes },
  { id: "molecules", label: "Molecules", icon: FlaskConical },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "contacts", label: "Contacts", icon: Mail },
  { id: "settings", label: "Settings", icon: Settings },
];

const productImageSlots: Array<{
  slot: 1 | 2 | 3;
  imageKey: "imageUrl1" | "imageUrl2" | "imageUrl3";
  clearKey: "clearImage1" | "clearImage2" | "clearImage3";
}> = [
  { slot: 1, imageKey: "imageUrl1", clearKey: "clearImage1" },
  { slot: 2, imageKey: "imageUrl2", clearKey: "clearImage2" },
  { slot: 3, imageKey: "imageUrl3", clearKey: "clearImage3" },
];

const fieldClassName =
  "border-input bg-background text-foreground focus-visible:border-primary focus-visible:ring-primary/30";

function emptyProductForm(): ProductFormState {
  return {
    name: "",
    slug: "",
    categoryId: "",
    manufacturer: "",
    isActive: true,
    price: "",
    mrp: "",
    priceSuffix: "",
    mrpSuffix: "",
    dosage: "",
    packSize: "",
    salts: "",
    moleculeIds: [],
    description: "",
    keyBenefits: "",
    goodToKnow: "",
    dietType: "",
    productForm: "",
    allergiesInformation: "",
    directionForUse: "",
    safetyInformation: "",
    schema: "",
    specialBenefitSchemes: "",
    faqs: "",
    imageUrl1: "",
    imageUrl2: "",
    imageUrl3: "",
    clearImage1: false,
    clearImage2: false,
    clearImage3: false,
  };
}

function emptyMoleculeForm(): MoleculeFormState {
  return {
    name: "",
    slug: "",
    synonyms: "",
    imageUrl: "",
    clearImage: false,
    isPublished: true,
    overview: "",
    backgroundAndApproval: "",
    uses: "",
    administration: "",
    sideEffects: "",
    warnings: "",
    precautions: "",
    expertTips: "",
    faqs: "",
    references: "",
  };
}

function emptyCategoryForm(): CategoryFormState {
  return {
    name: "",
    slug: "",
    description: "",
    isActive: true,
  };
}

function paiseToInput(value: number | null): string {
  if (value === null) return "";
  return (value / 100).toFixed(2);
}

function inputToPaise(value: string): number {
  const parsed = Number.parseFloat(value.trim());
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.round(parsed * 100);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isCurrentDay(value: string) {
  const current = new Date();
  const date = new Date(value);
  return current.toDateString() === date.toDateString();
}

function withinLastDays(value: string, days: number) {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(value).getTime() >= threshold;
}

function withinCurrentMonth(value: string) {
  const current = new Date();
  const date = new Date(value);
  return current.getMonth() === date.getMonth() && current.getFullYear() === date.getFullYear();
}

function withinCurrentYear(value: string) {
  const current = new Date();
  const date = new Date(value);
  return current.getFullYear() === date.getFullYear();
}

function readFileRaw(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 0.82;

/**
 * Downscales and re-encodes uploaded images before they are stored as data URLs,
 * since product/molecule images are currently persisted inline in the database.
 * SVGs and GIFs are passed through untouched — canvas re-encoding would strip
 * vector fidelity and animation.
 */
async function readFileAsDataUrl(file: File) {
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return readFileRaw(file);
  }

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    return readFileRaw(file);
  }

  try {
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return readFileRaw(file);

    ctx.drawImage(bitmap, 0, 0, width, height);

    // Keep PNGs as PNG to preserve transparency; re-encode everything else as JPEG for compression.
    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
    return canvas.toDataURL(outputType, IMAGE_QUALITY);
  } finally {
    bitmap.close();
  }
}

function isInlineImageValue(value: string) {
  return value.startsWith("data:") || value.startsWith("blob:");
}

function getImageInputValue(value: string) {
  if (!value || isInlineImageValue(value)) {
    return "";
  }

  return value;
}

function getErrorMessage(errorBody: { error?: string; details?: { fieldErrors?: Record<string, string[] | undefined> } }, fallback: string) {
  const fieldMessages = Object.values(errorBody.details?.fieldErrors ?? {})
    .flat()
    .filter((message): message is string => Boolean(message));

  return fieldMessages[0] || errorBody.error || fallback;
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error(`Request failed for ${url}`);
  }
  return (await response.json()) as T;
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: typeof Inbox; title: string; description: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
      <Icon className="h-10 w-10 text-gray-400" />
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">{description}</p>
    </div>
  );
}

function LoadingCardGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 h-8 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 5, columns = 3 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="grid gap-4 px-6 py-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((__, column) => (
              <div key={column} className="h-4 animate-pulse rounded bg-gray-200" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function BannerNotice({ banner }: { banner: Banner }) {
  if (!banner) return null;

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
        banner.type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {banner.type === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4" />}
      <span>{banner.text}</span>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  shown,
  onChange,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  shown: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-[220px_1fr] md:items-center">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={shown ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={fieldClassName}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-700 active:scale-95"
          aria-label={shown ? "Hide password" : "Show password"}
        >
          {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function ImagePreview({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return (
      <div className="flex size-[120px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-center text-xs text-gray-500">
        No preview
      </div>
    );
  }

  return (
    <div className="relative size-[120px] overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
      <ManagedImage src={src} alt={alt} fill sizes="120px" className="object-cover" />
    </div>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [molecules, setMolecules] = useState<MoleculeRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [contactConfig, setContactConfig] = useState<ContactConfigRecord | null>(null);

  const [productsState, setProductsState] = useState<LoadState>("loading");
  const [moleculesState, setMoleculesState] = useState<LoadState>("loading");
  const [categoriesState, setCategoriesState] = useState<LoadState>("loading");
  const [contactsState, setContactsState] = useState<LoadState>("loading");
  const [contactConfigState, setContactConfigState] = useState<LoadState>("loading");

  const [dashboardBanner, setDashboardBanner] = useState<Banner>(null);
  const [productBanner, setProductBanner] = useState<Banner>(null);
  const [moleculeBanner, setMoleculeBanner] = useState<Banner>(null);
  const [categoryBanner, setCategoryBanner] = useState<Banner>(null);
  const [passwordBanner, setPasswordBanner] = useState<Banner>(null);

  const [productsView, setProductsView] = useState<"list" | "form">("list");
  const [moleculesView, setMoleculesView] = useState<"list" | "form">("list");

  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [editingMolecule, setEditingMolecule] = useState<MoleculeRecord | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm());
  const [moleculeForm, setMoleculeForm] = useState<MoleculeFormState>(emptyMoleculeForm());
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm());

  const [productSlugEdited, setProductSlugEdited] = useState(false);
  const [moleculeSlugEdited, setMoleculeSlugEdited] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [moleculeSearch, setMoleculeSearch] = useState("");
  const [moleculePublishedFilter, setMoleculePublishedFilter] = useState<"all" | "yes" | "no">("all");
  const [moleculeDateFilter, setMoleculeDateFilter] = useState<"any" | "today" | "7d" | "month" | "year">("any");

  const [productSaving, setProductSaving] = useState(false);
  const [moleculeSaving, setMoleculeSaving] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [logoutSaving, setLogoutSaving] = useState(false);
  const [historyState, setHistoryState] = useState<HistoryState>(null);
  const [productSubmitMode, setProductSubmitMode] = useState<SubmitMode>("save");
  const [moleculeSubmitMode, setMoleculeSubmitMode] = useState<SubmitMode>("save");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisibility, setPasswordVisibility] = useState<PasswordVisibility>({
    current: false,
    next: false,
    confirm: false,
  });

  const deferredProductSearch = useDeferredValue(productSearch.trim().toLowerCase());
  const deferredMoleculeSearch = useDeferredValue(moleculeSearch.trim().toLowerCase());

  useEffect(() => {
    void Promise.all([loadProducts(), loadMolecules(), loadCategories(), loadContacts(), loadContactConfig()]);
  }, []);

  async function loadProducts() {
    setProductsState("loading");
    try {
      const data = await fetchJson<ProductRecord[]>("/api/admin/products");
      setProducts(data);
      setProductsState("ready");
    } catch {
      setProductsState("error");
      setDashboardBanner({ type: "error", text: "Products could not be loaded." });
    }
  }

  async function loadMolecules() {
    setMoleculesState("loading");
    try {
      const data = await fetchJson<MoleculeRecord[]>("/api/admin/molecules");
      setMolecules(data);
      setMoleculesState("ready");
    } catch {
      setMoleculesState("error");
      setDashboardBanner({ type: "error", text: "Molecules could not be loaded." });
    }
  }

  async function loadCategories() {
    setCategoriesState("loading");
    try {
      const data = await fetchJson<CategoryRecord[]>("/api/admin/categories");
      setCategories(data);
      setCategoriesState("ready");
    } catch {
      setCategoriesState("error");
      setDashboardBanner({ type: "error", text: "Categories could not be loaded." });
    }
  }

  async function loadContacts() {
    setContactsState("loading");
    try {
      const response = await fetch("/api/admin/contacts", { credentials: "same-origin" });
      if (response.status === 404) {
        setContacts([]);
        setContactsState("ready");
        return;
      }
      if (!response.ok) {
        throw new Error("Failed contacts request");
      }
      setContacts((await response.json()) as ContactRecord[]);
      setContactsState("ready");
    } catch {
      setContacts([]);
      setContactsState("error");
    }
  }

  async function loadContactConfig() {
    setContactConfigState("loading");
    try {
      const data = await fetchJson<ContactConfigRecord>("/api/admin/contact");
      setContactConfig(data);
      setContactConfigState("ready");
    } catch {
      setContactConfigState("error");
    }
  }

  function openNewProductForm() {
    setEditingProduct(null);
    setProductForm(emptyProductForm());
    setProductSlugEdited(false);
    setProductBanner(null);
    setProductsView("form");
    setActiveTab("products");
  }

  function openEditProductForm(product: ProductRecord) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId ?? "",
      manufacturer: product.manufacturer ?? "",
      isActive: product.isActive,
      price: paiseToInput(product.pricePaise),
      mrp: paiseToInput(product.mrpPaise),
      priceSuffix: product.priceSuffix ?? "",
      mrpSuffix: product.mrpSuffix ?? "",
      dosage: product.dosage ?? "",
      packSize: product.packSize ?? "",
      salts: product.salts ?? "",
      moleculeIds: product.molecules?.map((entry) => entry.moleculeId) ?? [],
      description: product.description ?? "",
      keyBenefits: product.keyBenefits ?? "",
      goodToKnow: product.goodToKnow ?? "",
      dietType: product.dietType ?? "",
      productForm: product.productForm ?? "",
      allergiesInformation: product.allergiesInformation ?? "",
      directionForUse: product.directionForUse ?? "",
      safetyInformation: product.safetyInformation ?? "",
      schema: product.schema ?? "",
      specialBenefitSchemes: product.specialBenefitSchemes ?? "",
      faqs: product.faqs ?? "",
      imageUrl1: product.imageUrl1 ?? "",
      imageUrl2: product.imageUrl2 ?? "",
      imageUrl3: product.imageUrl3 ?? "",
      clearImage1: false,
      clearImage2: false,
      clearImage3: false,
    });
    setProductSlugEdited(true);
    setProductBanner(null);
    setProductsView("form");
    setActiveTab("products");
  }

  function openNewMoleculeForm() {
    setEditingMolecule(null);
    setMoleculeForm(emptyMoleculeForm());
    setMoleculeSlugEdited(false);
    setMoleculeBanner(null);
    setMoleculesView("form");
    setActiveTab("molecules");
  }

  function openEditMoleculeForm(molecule: MoleculeRecord) {
    setEditingMolecule(molecule);
    setMoleculeForm({
      name: molecule.name,
      slug: molecule.slug,
      synonyms: molecule.synonyms ?? "",
      imageUrl: molecule.imageUrl ?? "",
      clearImage: false,
      isPublished: molecule.isPublished,
      overview: molecule.overview ?? "",
      backgroundAndApproval: molecule.backgroundAndApproval ?? "",
      uses: molecule.uses ?? "",
      administration: molecule.administration ?? "",
      sideEffects: molecule.sideEffects ?? "",
      warnings: molecule.warnings ?? "",
      precautions: molecule.precautions ?? "",
      expertTips: molecule.expertTips ?? "",
      faqs: molecule.faqs ?? "",
      references: molecule.references ?? "",
    });
    setMoleculeSlugEdited(true);
    setMoleculeBanner(null);
    setMoleculesView("form");
    setActiveTab("molecules");
  }

  function beginAddCategory() {
    setIsAddingCategory(true);
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm());
    setCategoryBanner(null);
  }

  function beginEditCategory(category: CategoryRecord) {
    setEditingCategoryId(category.id);
    setIsAddingCategory(false);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      isActive: category.isActive,
    });
    setCategoryBanner(null);
  }

  function resetCategoryEditor() {
    setEditingCategoryId(null);
    setIsAddingCategory(false);
    setCategoryForm(emptyCategoryForm());
  }

  async function handleProductImageChange(slot: 1 | 2 | 3, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setProductForm((current) => ({
        ...current,
        [`imageUrl${slot}`]: dataUrl,
        [`clearImage${slot}`]: false,
      }) as ProductFormState);
    } catch {
      setProductBanner({ type: "error", text: `Image ${slot} could not be read.` });
    }
  }

  async function handleMoleculeImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setMoleculeForm((current) => ({
        ...current,
        imageUrl: dataUrl,
        clearImage: false,
      }));
    } catch {
      setMoleculeBanner({ type: "error", text: "The selected molecule image could not be read." });
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProductSaving(true);
    setProductBanner(null);

    if (!productForm.name.trim() || !productForm.slug.trim()) {
      setProductBanner({ type: "error", text: "Name and slug are required." });
      setProductSaving(false);
      return;
    }

    if (!productForm.categoryId) {
      setProductBanner({ type: "error", text: "Category is required so the product appears on its category page." });
      setProductSaving(false);
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      slug: productForm.slug.trim(),
      categoryId: productForm.categoryId || null,
      manufacturer: productForm.manufacturer.trim() || undefined,
      isActive: productForm.isActive,
      pricePaise: inputToPaise(productForm.price),
      mrpPaise: productForm.mrp.trim() ? inputToPaise(productForm.mrp) : null,
      priceSuffix: productForm.priceSuffix.trim() || null,
      mrpSuffix: productForm.mrpSuffix.trim() || null,
      dosage: productForm.dosage.trim() || undefined,
      packSize: productForm.packSize.trim() || undefined,
      salts: productForm.salts.trim() || undefined,
      moleculeIds: productForm.moleculeIds,
      description: productForm.description.trim() || undefined,
      keyBenefits: productForm.keyBenefits.trim() || undefined,
      goodToKnow: productForm.goodToKnow.trim() || undefined,
      dietType: productForm.dietType.trim() || undefined,
      productForm: productForm.productForm.trim() || undefined,
      allergiesInformation: productForm.allergiesInformation.trim() || undefined,
      directionForUse: productForm.directionForUse.trim() || undefined,
      safetyInformation: productForm.safetyInformation.trim() || undefined,
      schema: productForm.schema.trim() || undefined,
      specialBenefitSchemes: productForm.specialBenefitSchemes.trim() || undefined,
      faqs: productForm.faqs.trim() || undefined,
      imageUrl1: productForm.clearImage1 ? null : productForm.imageUrl1 || null,
      imageUrl2: productForm.clearImage2 ? null : productForm.imageUrl2 || null,
      imageUrl3: productForm.clearImage3 ? null : productForm.imageUrl3 || null,
    };

    try {
      const response = await fetch(editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products", {
        method: editingProduct ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({ error: "Could not save product." }))) as {
          error?: string;
          details?: {
            fieldErrors?: Record<string, string[] | undefined>;
          };
        };
        throw new Error(getErrorMessage(errorBody, "Could not save product."));
      }

      const saved = (await response.json()) as ProductRecord;
      await loadProducts();
      setProductBanner({ type: "success", text: editingProduct ? "Product updated." : "Product created." });

      if (productSubmitMode === "save-add-another") {
        startTransition(() => {
          setEditingProduct(null);
          setProductForm(emptyProductForm());
          setProductSlugEdited(false);
        });
      } else if (productSubmitMode === "save") {
        startTransition(() => {
          setProductsView("list");
          setEditingProduct(null);
        });
      } else {
        startTransition(() => {
          setEditingProduct(saved);
          openEditProductForm(saved);
        });
      }
    } catch (error) {
      setProductBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Could not save product.",
      });
    } finally {
      setProductSaving(false);
    }
  }

  async function saveMolecule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMoleculeSaving(true);
    setMoleculeBanner(null);

    if (!moleculeForm.name.trim() || !moleculeForm.slug.trim()) {
      setMoleculeBanner({ type: "error", text: "Name and slug are required." });
      setMoleculeSaving(false);
      return;
    }

    const payload = {
      name: moleculeForm.name.trim(),
      slug: moleculeForm.slug.trim(),
      synonyms: moleculeForm.synonyms.trim() || undefined,
      imageUrl: moleculeForm.clearImage ? null : moleculeForm.imageUrl || null,
      isPublished: moleculeForm.isPublished,
      overview: moleculeForm.overview.trim() || undefined,
      backgroundAndApproval: moleculeForm.backgroundAndApproval.trim() || undefined,
      uses: moleculeForm.uses.trim() || undefined,
      administration: moleculeForm.administration.trim() || undefined,
      sideEffects: moleculeForm.sideEffects.trim() || undefined,
      warnings: moleculeForm.warnings.trim() || undefined,
      precautions: moleculeForm.precautions.trim() || undefined,
      expertTips: moleculeForm.expertTips.trim() || undefined,
      faqs: moleculeForm.faqs.trim() || undefined,
      references: moleculeForm.references.trim() || undefined,
    };

    try {
      const response = await fetch(editingMolecule ? `/api/admin/molecules/${editingMolecule.id}` : "/api/admin/molecules", {
        method: editingMolecule ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({ error: "Could not save molecule." }))) as {
          error?: string;
          details?: {
            fieldErrors?: Record<string, string[] | undefined>;
          };
        };
        throw new Error(getErrorMessage(errorBody, "Could not save molecule."));
      }

      const saved = (await response.json()) as MoleculeRecord;
      await loadMolecules();
      setMoleculeBanner({ type: "success", text: editingMolecule ? "Molecule updated." : "Molecule created." });

      if (moleculeSubmitMode === "save-add-another") {
        startTransition(() => {
          setEditingMolecule(null);
          setMoleculeForm(emptyMoleculeForm());
          setMoleculeSlugEdited(false);
        });
      } else if (moleculeSubmitMode === "save") {
        startTransition(() => {
          setMoleculesView("list");
          setEditingMolecule(null);
        });
      } else {
        startTransition(() => {
          setEditingMolecule(saved);
          openEditMoleculeForm(saved);
        });
      }
    } catch (error) {
      setMoleculeBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Could not save molecule.",
      });
    } finally {
      setMoleculeSaving(false);
    }
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCategorySaving(true);
    setCategoryBanner(null);

    try {
      const response = await fetch(editingCategoryId ? `/api/admin/categories/${editingCategoryId}` : "/api/admin/categories", {
        method: editingCategoryId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: categoryForm.name.trim(),
          slug: categoryForm.slug.trim(),
          description: categoryForm.description.trim() || undefined,
          isActive: categoryForm.isActive,
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({ error: "Could not save category." }))) as {
          error?: string;
        };
        throw new Error(errorBody.error || "Could not save category.");
      }

      await loadCategories();
      resetCategoryEditor();
      setCategoryBanner({ type: "success", text: editingCategoryId ? "Category updated." : "Category created." });
    } catch (error) {
      setCategoryBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Could not save category.",
      });
    } finally {
      setCategorySaving(false);
    }
  }

  async function deleteCategory(id: string) {
    if (!window.confirm("Delete this category?")) return;

    setCategorySaving(true);
    setCategoryBanner(null);

    try {
      const response = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Could not delete category.");
      }
      await loadCategories();
      if (editingCategoryId === id) {
        resetCategoryEditor();
      }
      setCategoryBanner({ type: "success", text: "Category deleted." });
    } catch (error) {
      setCategoryBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Could not delete category.",
      });
    } finally {
      setCategorySaving(false);
    }
  }

  async function deleteProduct(id: string, name: string) {
    if (!window.confirm(`Delete ${name}?`)) return;

    setProductSaving(true);
    setProductBanner(null);

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({ error: "Could not delete product." }))) as {
          error?: string;
        };
        throw new Error(errorBody.error || "Could not delete product.");
      }

      await loadProducts();
      if (editingProduct?.id === id) {
        startTransition(() => {
          setProductsView("list");
          setEditingProduct(null);
        });
      }
      setProductBanner({ type: "success", text: "Product deleted." });
    } catch (error) {
      setProductBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Could not delete product.",
      });
    } finally {
      setProductSaving(false);
    }
  }

  async function deleteMolecule(id: string, name: string) {
    if (!window.confirm(`Delete ${name}?`)) return;

    setMoleculeSaving(true);
    setMoleculeBanner(null);

    try {
      const response = await fetch(`/api/admin/molecules/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({ error: "Could not delete molecule." }))) as {
          error?: string;
        };
        throw new Error(errorBody.error || "Could not delete molecule.");
      }

      await loadMolecules();
      if (editingMolecule?.id === id) {
        startTransition(() => {
          setMoleculesView("list");
          setEditingMolecule(null);
        });
      }
      setMoleculeBanner({ type: "success", text: "Molecule deleted." });
    } catch (error) {
      setMoleculeBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Could not delete molecule.",
      });
    } finally {
      setMoleculeSaving(false);
    }
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordBanner(null);

    if (newPassword.length < 8) {
      setPasswordBanner({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordBanner({ type: "error", text: "New password and confirm password must match." });
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const body = (await response.json().catch(() => ({}))) as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(body.error || "Password could not be updated.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordBanner({ type: "success", text: "Password updated successfully." });
    } catch (error) {
      setPasswordBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Password could not be updated.",
      });
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleLogout() {
    setLogoutSaving(true);
    setDashboardBanner(null);

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Logout failed. Please try again.");
      }

      startTransition(() => {
        router.refresh();
        router.push("/admin");
      });
    } catch (error) {
      setDashboardBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Logout failed. Please try again.",
      });
      setLogoutSaving(false);
    }
  }

  const filteredProducts = products.filter((product) => {
    if (!deferredProductSearch) return true;
    return product.name.toLowerCase().includes(deferredProductSearch);
  });

  const filteredMolecules = molecules
    .filter((molecule) => {
      const matchesSearch = deferredMoleculeSearch ? molecule.name.toLowerCase().includes(deferredMoleculeSearch) : true;
      const matchesPublished =
        moleculePublishedFilter === "all"
          ? true
          : moleculePublishedFilter === "yes"
            ? molecule.isPublished
            : !molecule.isPublished;

      const matchesDate =
        moleculeDateFilter === "any"
          ? true
          : moleculeDateFilter === "today"
            ? isCurrentDay(molecule.updatedAt)
            : moleculeDateFilter === "7d"
              ? withinLastDays(molecule.updatedAt, 7)
              : moleculeDateFilter === "month"
                ? withinCurrentMonth(molecule.updatedAt)
                : withinCurrentYear(molecule.updatedAt);

      return matchesSearch && matchesPublished && matchesDate;
    })
    .sort((left, right) => left.name.localeCompare(right.name));

  const recentActions: RecentAction[] = [...products.map((product) => ({
    key: `product-${product.id}`,
    kind: "product" as const,
    id: product.id,
    name: product.name,
    slug: product.slug,
    updatedAt: product.updatedAt,
  })), ...molecules.map((molecule) => ({
    key: `molecule-${molecule.id}`,
    kind: "molecule" as const,
    id: molecule.id,
    name: molecule.name,
    slug: molecule.slug,
    updatedAt: molecule.updatedAt,
  }))]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 10);

  return (
    <div className="admin-theme min-h-screen bg-background">
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-5 lg:px-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D7377]">Admin Console</p>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-gray-900 sm:mt-2 sm:text-3xl">SSG Pharma Management</h1>
                <p className="mt-2 text-sm text-gray-500">Catalog, molecules, contacts, and account settings in one place.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                className="mt-0.5 h-8 shrink-0 rounded-full border-gray-300 bg-white px-3 text-xs text-gray-600 hover:border-[#0D7377]/40 hover:text-[#0D7377]"
                onClick={handleLogout}
                disabled={logoutSaving}
              >
                {logoutSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                Logout
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm ${
                      active
                        ? "border-[#0D7377] bg-[#0D7377] text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-[#0D7377]/40 hover:text-[#0D7377] active:scale-[0.99]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === "dashboard" ? (
          <div className="space-y-8">
            <BannerNotice banner={dashboardBanner} />

            {productsState === "loading" || moleculesState === "loading" || categoriesState === "loading" ? (
              <LoadingCardGrid />
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-gray-200 bg-white shadow-sm">
                  <CardHeader className="pb-0">
                    <CardDescription>Total Products</CardDescription>
                    <CardTitle className="text-4xl font-semibold text-[#0D7377]">{products.length}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-gray-200 bg-white shadow-sm">
                  <CardHeader className="pb-0">
                    <CardDescription>Total Molecules</CardDescription>
                    <CardTitle className="text-4xl font-semibold text-[#0D7377]">{molecules.length}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-gray-200 bg-white shadow-sm">
                  <CardHeader className="pb-0">
                    <CardDescription>Total Categories</CardDescription>
                    <CardTitle className="text-4xl font-semibold text-[#0D7377]">{categories.length}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <Button className="h-14 bg-[#0D7377] text-white hover:bg-[#0b6669]" onClick={openNewProductForm}>
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
              <Button className="h-14 bg-[#0D7377] text-white hover:bg-[#0b6669]" onClick={openNewMoleculeForm}>
                <Plus className="h-4 w-4" />
                Add Molecule
              </Button>
              <Button
                className="h-14 bg-[#0D7377] text-white hover:bg-[#0b6669]"
                onClick={() => {
                  setActiveTab("categories");
                  beginAddCategory();
                }}
              >
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </div>

            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Recent Actions</CardTitle>
                <CardDescription>Last 10 products or molecules updated in the catalog.</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActions.length === 0 ? (
                  <EmptyState icon={Inbox} title="No recent actions" description="Create or update a product or molecule to see activity here." />
                ) : (
                  <div className="divide-y divide-gray-100">
                    {recentActions.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          if (item.kind === "product") {
                            const match = products.find((product) => product.id === item.id);
                            if (match) {
                              openEditProductForm(match);
                            }
                          } else {
                            const match = molecules.find((molecule) => molecule.id === item.id);
                            if (match) {
                              openEditMoleculeForm(match);
                            }
                          }
                        }}
                        className="flex w-full items-center justify-between gap-4 px-1 py-4 text-left transition hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.kind === "product" ? "Product" : "Molecule"} · {item.slug}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(item.updatedAt)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {activeTab === "products" ? (
          <div className="space-y-6">
            {productsView === "list" ? (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative max-w-md flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={productSearch}
                      onChange={(event) => setProductSearch(event.target.value)}
                      placeholder="Search products by name"
                      className={`pl-10 ${fieldClassName}`}
                    />
                  </div>
                  <Button className="bg-[#0D7377] text-white hover:bg-[#0b6669]" onClick={openNewProductForm}>
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </div>

                <BannerNotice banner={productBanner} />

                {productsState === "loading" ? (
                  <TableSkeleton columns={3} />
                ) : filteredProducts.length === 0 ? (
                  <EmptyState icon={Boxes} title="No products found" description="Try a different search term or add a new product to start building the catalog." />
                ) : (
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Slug</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((product) => (
                          <tr
                            key={product.id}
                            onClick={() => openEditProductForm(product)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                openEditProductForm(product);
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            className="cursor-pointer transition hover:bg-[#0D7377]/5 active:bg-[#0D7377]/10"
                          >
                            <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{product.slug}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{product.category?.name ?? "Uncategorized"}</td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-300"
                                  onKeyDown={(event) => event.stopPropagation()}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    void deleteProduct(product.id, product.name);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={saveProduct} className="space-y-6">
                <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setProductsView("list");
                        setProductBanner(null);
                      }}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#0D7377] transition hover:text-[#0b6669]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <h2 className="mt-3 text-2xl font-semibold text-gray-900">{editingProduct?.name || "Add Product"}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {editingProduct ? "Update catalog details, packaging, and imagery." : "Create a new product record for the catalog."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300"
                      onClick={() =>
                        setHistoryState(
                          editingProduct
                            ? {
                                kind: "product",
                                name: editingProduct.name,
                                createdAt: editingProduct.createdAt,
                                updatedAt: editingProduct.updatedAt,
                              }
                            : null,
                        )
                      }
                      disabled={!editingProduct}
                    >
                      <History className="h-4 w-4" />
                      History
                    </Button>
                    <Button type="button" variant="outline" className="border-gray-300" asChild>
                      <Link href={editingProduct ? `/products/${editingProduct.slug}` : "/products"} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                        View on site
                      </Link>
                    </Button>
                    {editingProduct ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        onClick={() => void deleteProduct(editingProduct.id, editingProduct.name)}
                        disabled={productSaving}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </div>

                <BannerNotice banner={productBanner} />

                <SectionCard title="Basic Info">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="product-name" className="text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <Input
                        id="product-name"
                        value={productForm.name}
                        onChange={(event) =>
                          setProductForm((current) => {
                            const nextName = event.target.value;
                            return {
                              ...current,
                              name: nextName,
                              slug: productSlugEdited ? current.slug : slugify(nextName),
                            };
                          })
                        }
                        className={fieldClassName}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="product-slug" className="text-sm font-medium text-gray-700">
                        Slug
                      </label>
                      <Input
                        id="product-slug"
                        value={productForm.slug}
                        onChange={(event) => {
                          setProductSlugEdited(true);
                          setProductForm((current) => ({ ...current, slug: slugify(event.target.value) }));
                        }}
                        className={fieldClassName}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="product-category" className="text-sm font-medium text-gray-700">
                        Category <span className="text-red-600">*</span>
                      </label>
                      <select
                        id="product-category"
                        required
                        value={productForm.categoryId}
                        onChange={(event) => setProductForm((current) => ({ ...current, categoryId: event.target.value }))}
                        className={`flex h-10 w-full rounded-md border px-3 text-sm outline-none transition focus:border-[#0D7377] focus:ring-4 focus:ring-[#0D7377]/10 ${fieldClassName}`}
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500">
                        Products without a category only appear on the All Products page, not on their category page.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="product-manufacturer" className="text-sm font-medium text-gray-700">
                        Manufacturer
                      </label>
                      <Input
                        id="product-manufacturer"
                        value={productForm.manufacturer}
                        onChange={(event) => setProductForm((current) => ({ ...current, manufacturer: event.target.value }))}
                        className={fieldClassName}
                      />
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={productForm.isActive}
                      onChange={(event) => setProductForm((current) => ({ ...current, isActive: event.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-[#0D7377] focus:ring-[#0D7377]"
                    />
                    Is Active
                  </label>
                </SectionCard>

                <SectionCard title="Pricing & Packaging">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="product-price" className="text-sm font-medium text-gray-700">
                        Price
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="product-price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={productForm.price}
                          onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
                          className={fieldClassName}
                        />
                        <Input
                          id="product-price-suffix"
                          placeholder="/vial"
                          value={productForm.priceSuffix}
                          onChange={(event) => setProductForm((current) => ({ ...current, priceSuffix: event.target.value }))}
                          className={fieldClassName}
                        />
                      </div>
                      <p className="text-xs text-gray-500">Optional suffix (e.g., /vial, /bottle, /strip)</p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="product-mrp" className="text-sm font-medium text-gray-700">
                        MRP
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="product-mrp"
                          type="number"
                          min="0"
                          step="0.01"
                          value={productForm.mrp}
                          onChange={(event) => setProductForm((current) => ({ ...current, mrp: event.target.value }))}
                          className={fieldClassName}
                        />
                        <Input
                          id="product-mrp-suffix"
                          placeholder="/vial"
                          value={productForm.mrpSuffix}
                          onChange={(event) => setProductForm((current) => ({ ...current, mrpSuffix: event.target.value }))}
                          className={fieldClassName}
                        />
                      </div>
                      <p className="text-xs text-gray-500">Optional suffix (e.g., /vial, /bottle, /strip)</p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="product-dosage" className="text-sm font-medium text-gray-700">
                        Dosage
                      </label>
                      <Input
                        id="product-dosage"
                        value={productForm.dosage}
                        onChange={(event) => setProductForm((current) => ({ ...current, dosage: event.target.value }))}
                        className={fieldClassName}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="product-pack-size" className="text-sm font-medium text-gray-700">
                        Pack Size
                      </label>
                      <Input
                        id="product-pack-size"
                        value={productForm.packSize}
                        onChange={(event) => setProductForm((current) => ({ ...current, packSize: event.target.value }))}
                        className={fieldClassName}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="product-salts" className="text-sm font-medium text-gray-700">
                        Salt
                      </label>
                      <Input
                        id="product-salts"
                        value={productForm.salts}
                        onChange={(event) => setProductForm((current) => ({ ...current, salts: event.target.value }))}
                        className={fieldClassName}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Linked Molecules</label>
                      <p className="text-xs text-gray-500">
                        Select the molecule(s) this product contains so it appears on their molecule pages.
                      </p>
                      <div className="grid gap-2 rounded-md border border-input p-3 sm:grid-cols-2 md:grid-cols-3">
                        {molecules.length === 0 ? (
                          <span className="text-sm text-gray-500">No molecules available yet.</span>
                        ) : (
                          molecules.map((molecule) => {
                            const checked = productForm.moleculeIds.includes(molecule.id);
                            return (
                              <label key={molecule.id} className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(event) =>
                                    setProductForm((current) => ({
                                      ...current,
                                      moleculeIds: event.target.checked
                                        ? [...current.moleculeIds, molecule.id]
                                        : current.moleculeIds.filter((id) => id !== molecule.id),
                                    }))
                                  }
                                  className="h-4 w-4"
                                />
                                {molecule.name}
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Product Details">
                  <div className="grid gap-4">
                    {[
                      { id: "description", label: "Description", value: productForm.description },
                      { id: "key-benefits", label: "Key Benefits", value: productForm.keyBenefits },
                      { id: "good-to-know", label: "Good to Know", value: productForm.goodToKnow },
                    ].map((field, index) => (
                      <div key={field.id} className="space-y-2">
                        <label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                          {field.label}
                        </label>
                        <Textarea
                          id={field.id}
                          value={field.value}
                          onChange={(event) =>
                            setProductForm((current) =>
                              index === 0
                                ? { ...current, description: event.target.value }
                                : index === 1
                                  ? { ...current, keyBenefits: event.target.value }
                                  : { ...current, goodToKnow: event.target.value },
                            )
                          }
                          className={fieldClassName}
                        />
                      </div>
                    ))}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="product-diet-type" className="text-sm font-medium text-gray-700">
                          Diet Type
                        </label>
                        <Input
                          id="product-diet-type"
                          value={productForm.dietType}
                          onChange={(event) => setProductForm((current) => ({ ...current, dietType: event.target.value }))}
                          className={fieldClassName}
                        />
                        <p className="text-xs text-gray-500">e.g. Vegetarian, Vegan, Non-Vegetarian</p>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="product-form" className="text-sm font-medium text-gray-700">
                          Product Form
                        </label>
                        <Input
                          id="product-form"
                          value={productForm.productForm}
                          onChange={(event) => setProductForm((current) => ({ ...current, productForm: event.target.value }))}
                          className={fieldClassName}
                        />
                        <p className="text-xs text-gray-500">e.g. Tablet, Capsule, Powder, Liquid</p>
                      </div>
                    </div>
                    {[
                      { id: "allergies-information", label: "Allergies Information", key: "allergiesInformation" as const },
                      { id: "direction-for-use", label: "Direction for Use", key: "directionForUse" as const },
                      { id: "safety-information", label: "Safety Information", key: "safetyInformation" as const },
                      { id: "schema", label: "Schema", key: "schema" as const },
                      { id: "special-schemes", label: "Special Patient Benefit Schemes", key: "specialBenefitSchemes" as const },
                      { id: "faqs", label: "FAQs", key: "faqs" as const },
                    ].map((field) => (
                      <div key={field.id} className="space-y-2">
                        <label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                          {field.label}
                        </label>
                        <Textarea
                          id={field.id}
                          value={productForm[field.key]}
                          onChange={(event) =>
                            setProductForm((current) => ({
                              ...current,
                              [field.key]: event.target.value,
                            }))
                          }
                          className={fieldClassName}
                        />
                        {field.key === "specialBenefitSchemes" ? (
                          <p className="text-xs text-gray-500">Enter each scheme on a new line, e.g. 1+1 Free Vial Scheme</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Images" description="Upload up to three images or paste direct image links.">
                  <div className="grid gap-4 lg:grid-cols-3">
                    {productImageSlots.map(({ slot, imageKey, clearKey }) => {
                      const value = productForm[imageKey];
                      const clearValue = productForm[clearKey];

                      return (
                        <div key={slot} className="rounded-lg border border-gray-200 p-4">
                          <p className="text-sm font-semibold text-gray-900">Image {slot}</p>
                          <div className="mt-4 flex justify-center">
                            <ImagePreview src={clearValue ? "" : value} alt={`Product image ${slot} preview`} />
                          </div>
                          <div className="mt-4 space-y-2">
                            <label htmlFor={`product-image-url-${slot}`} className="text-xs font-medium text-gray-700">
                              Paste image link
                            </label>
                            <Input
                              id={`product-image-url-${slot}`}
                              type="text"
                              value={clearValue ? "" : getImageInputValue(value)}
                              onChange={(event) =>
                                setProductForm((current) => ({
                                  ...current,
                                  [imageKey]: event.target.value,
                                  [clearKey]: false,
                                }))
                              }
                              placeholder="https://example.com/product-image.jpg"
                              className={fieldClassName}
                            />
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-gray-300"
                              onClick={() =>
                                setProductForm((current) => ({
                                  ...current,
                                  [clearKey]: true,
                                }))
                              }
                              disabled={!value && !clearValue}
                            >
                              Delete image
                            </Button>
                            {clearValue ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-gray-300"
                                onClick={() =>
                                  setProductForm((current) => ({
                                    ...current,
                                    [clearKey]: false,
                                  }))
                                }
                              >
                                Undo
                              </Button>
                            ) : null}
                          </div>
                          {clearValue ? <p className="mt-2 text-xs text-amber-700">This image will be removed when you save.</p> : null}
                          <div className="mt-4 space-y-2">
                            <label htmlFor={`product-image-file-${slot}`} className="text-xs font-medium text-gray-700">
                              Upload file
                            </label>
                            <Input
                              id={`product-image-file-${slot}`}
                              type="file"
                              accept="image/*"
                              className={fieldClassName}
                              onChange={(event) => void handleProductImageChange(slot as 1 | 2 | 3, event)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>

                <Card className="border-gray-200 bg-white shadow-sm">
                  <CardContent className="flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1 text-sm text-gray-500">
                      {editingProduct ? <p>Created At: {formatDate(editingProduct.createdAt)}</p> : <p>Created At: Will be set after save</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="submit"
                        className="bg-[#0D7377] text-white hover:bg-[#0b6669]"
                        disabled={productSaving}
                        onClick={() => setProductSubmitMode("save")}
                      >
                        {productSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save
                      </Button>
                      <Button
                        type="submit"
                        variant="outline"
                        className="border-gray-300"
                        disabled={productSaving}
                        onClick={() => setProductSubmitMode("save-add-another")}
                      >
                        Save and add another
                      </Button>
                      <Button
                        type="submit"
                        variant="outline"
                        className="border-gray-300"
                        disabled={productSaving}
                        onClick={() => setProductSubmitMode("save-continue")}
                      >
                        Save and continue editing
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </form>
            )}
          </div>
        ) : null}

        {activeTab === "molecules" ? (
          <div className="space-y-6">
            {moleculesView === "list" ? (
              <>
                <div className="grid gap-4 xl:grid-cols-[1fr_260px]">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="relative max-w-md flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          value={moleculeSearch}
                          onChange={(event) => setMoleculeSearch(event.target.value)}
                          placeholder="Search molecules"
                          className={`pl-10 ${fieldClassName}`}
                        />
                      </div>
                      <Button className="bg-[#0D7377] text-white hover:bg-[#0b6669]" onClick={openNewMoleculeForm}>
                        <Plus className="h-4 w-4" />
                        Add Molecule
                      </Button>
                    </div>
                    <BannerNotice banner={moleculeBanner} />

                    {moleculesState === "loading" ? (
                      <TableSkeleton columns={2} />
                    ) : filteredMolecules.length === 0 ? (
                      <EmptyState icon={FlaskConical} title="No molecules found" description="Adjust the search or filter settings, or add a new molecule record." />
                    ) : (
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Slug</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredMolecules.map((molecule) => (
                              <tr
                                key={molecule.id}
                                onClick={() => openEditMoleculeForm(molecule)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    openEditMoleculeForm(molecule);
                                  }
                                }}
                                tabIndex={0}
                                role="button"
                                className="cursor-pointer transition hover:bg-[#0D7377]/5 active:bg-[#0D7377]/10"
                              >
                                <td className="px-6 py-4 font-medium text-gray-900">{molecule.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{molecule.slug}</td>
                                <td className="px-6 py-4">
                                  <div className="flex justify-end">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="border-gray-300"
                                      onKeyDown={(event) => event.stopPropagation()}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        void deleteMolecule(molecule.id, molecule.name);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <Card className="h-fit border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">By Is Published</label>
                        <select
                          value={moleculePublishedFilter}
                          onChange={(event) => setMoleculePublishedFilter(event.target.value as "all" | "yes" | "no")}
                          className={`flex h-10 w-full rounded-md border px-3 text-sm outline-none transition focus:border-[#0D7377] focus:ring-4 focus:ring-[#0D7377]/10 ${fieldClassName}`}
                        >
                          <option value="all">All</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">By Updated At</label>
                        <select
                          value={moleculeDateFilter}
                          onChange={(event) => setMoleculeDateFilter(event.target.value as "any" | "today" | "7d" | "month" | "year")}
                          className={`flex h-10 w-full rounded-md border px-3 text-sm outline-none transition focus:border-[#0D7377] focus:ring-4 focus:ring-[#0D7377]/10 ${fieldClassName}`}
                        >
                          <option value="any">Any date</option>
                          <option value="today">Today</option>
                          <option value="7d">Past 7 days</option>
                          <option value="month">This month</option>
                          <option value="year">This year</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <form onSubmit={saveMolecule} className="space-y-6">
                <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setMoleculesView("list");
                        setMoleculeBanner(null);
                      }}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#0D7377] transition hover:text-[#0b6669]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <h2 className="mt-3 text-2xl font-semibold text-gray-900">{editingMolecule?.name || "Add Molecule"}</h2>
                    <p className="mt-1 text-sm text-gray-500">Publish core molecule content and keep its public reference page tidy.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300"
                      onClick={() =>
                        setHistoryState(
                          editingMolecule
                            ? {
                                kind: "molecule",
                                name: editingMolecule.name,
                                createdAt: editingMolecule.createdAt,
                                updatedAt: editingMolecule.updatedAt,
                              }
                            : null,
                        )
                      }
                      disabled={!editingMolecule}
                    >
                      <History className="h-4 w-4" />
                      History
                    </Button>
                    <Button type="button" variant="outline" className="border-gray-300" asChild>
                      <Link href={editingMolecule ? `/molecules/${editingMolecule.slug}` : "/molecules"} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                        View on site
                      </Link>
                    </Button>
                    {editingMolecule ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        onClick={() => void deleteMolecule(editingMolecule.id, editingMolecule.name)}
                        disabled={moleculeSaving}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </div>

                <BannerNotice banner={moleculeBanner} />

                <SectionCard title="Basic Info">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="molecule-name" className="text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <Input
                        id="molecule-name"
                        value={moleculeForm.name}
                        onChange={(event) =>
                          setMoleculeForm((current) => {
                            const nextName = event.target.value;
                            return {
                              ...current,
                              name: nextName,
                              slug: moleculeSlugEdited ? current.slug : slugify(nextName),
                            };
                          })
                        }
                        className={fieldClassName}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="molecule-slug" className="text-sm font-medium text-gray-700">
                        Slug
                      </label>
                      <Input
                        id="molecule-slug"
                        value={moleculeForm.slug}
                        onChange={(event) => {
                          setMoleculeSlugEdited(true);
                          setMoleculeForm((current) => ({ ...current, slug: slugify(event.target.value) }));
                        }}
                        className={fieldClassName}
                      />
                      <p className="text-xs text-gray-500">Auto-filled from name, can be customized</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="molecule-synonyms" className="text-sm font-medium text-gray-700">
                        Synonyms
                      </label>
                      <Input
                        id="molecule-synonyms"
                        value={moleculeForm.synonyms}
                        onChange={(event) => setMoleculeForm((current) => ({ ...current, synonyms: event.target.value }))}
                        className={fieldClassName}
                      />
                      <p className="text-xs text-gray-500">Comma-separated alternative names</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="molecule-image" className="text-sm font-medium text-gray-700">
                        Image
                      </label>
                      <div className="mt-1 flex justify-center md:justify-start">
                        <ImagePreview src={moleculeForm.clearImage ? "" : moleculeForm.imageUrl} alt="Molecule image preview" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="molecule-image-url" className="text-xs font-medium text-gray-700">
                          Paste image link
                        </label>
                        <Input
                          id="molecule-image-url"
                          type="text"
                          value={moleculeForm.clearImage ? "" : getImageInputValue(moleculeForm.imageUrl)}
                          onChange={(event) =>
                            setMoleculeForm((current) => ({
                              ...current,
                              imageUrl: event.target.value,
                              clearImage: false,
                            }))
                          }
                          placeholder="https://example.com/molecule-image.jpg"
                          className={fieldClassName}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-gray-300"
                          onClick={() =>
                            setMoleculeForm((current) => ({
                              ...current,
                              clearImage: true,
                            }))
                          }
                          disabled={!moleculeForm.imageUrl && !moleculeForm.clearImage}
                        >
                          Delete image
                        </Button>
                        {moleculeForm.clearImage ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-gray-300"
                            onClick={() =>
                              setMoleculeForm((current) => ({
                                ...current,
                                clearImage: false,
                              }))
                            }
                          >
                            Undo
                          </Button>
                        ) : null}
                      </div>
                      {moleculeForm.clearImage ? <p className="text-xs text-amber-700">This image will be removed when you save.</p> : null}
                      <div className="space-y-2">
                        <label htmlFor="molecule-image" className="text-xs font-medium text-gray-700">
                          Upload file
                        </label>
                        <Input id="molecule-image" type="file" accept="image/*" className={fieldClassName} onChange={(event) => void handleMoleculeImageChange(event)} />
                      </div>
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={moleculeForm.isPublished}
                      onChange={(event) => setMoleculeForm((current) => ({ ...current, isPublished: event.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-[#0D7377] focus:ring-[#0D7377]"
                    />
                    Is Published
                  </label>
                </SectionCard>

                <SectionCard title="Content">
                  <div className="grid gap-4">
                    {[
                      { id: "overview", label: "Overview", key: "overview" as const },
                      { id: "background", label: "Background and Approval", key: "backgroundAndApproval" as const },
                      { id: "uses", label: "Uses", key: "uses" as const },
                      { id: "administration", label: "Administration", key: "administration" as const },
                      { id: "side-effects", label: "Side Effects", key: "sideEffects" as const },
                      { id: "warnings", label: "Warnings", key: "warnings" as const },
                      { id: "precautions", label: "Precautions", key: "precautions" as const },
                      { id: "expert-tips", label: "Expert Tips", key: "expertTips" as const },
                      { id: "molecule-faqs", label: "FAQs", key: "faqs" as const },
                      { id: "references", label: "References", key: "references" as const },
                    ].map((field) => (
                      <div key={field.id} className="space-y-2">
                        <label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                          {field.label}
                        </label>
                        <Textarea
                          id={field.id}
                          value={moleculeForm[field.key]}
                          onChange={(event) =>
                            setMoleculeForm((current) => ({
                              ...current,
                              [field.key]: event.target.value,
                            }))
                          }
                          className={fieldClassName}
                        />
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <Card className="border-gray-200 bg-white shadow-sm">
                  <CardContent className="flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1 text-sm text-gray-500">
                      {editingMolecule ? <p>Created At: {formatDate(editingMolecule.createdAt)}</p> : <p>Created At: Will be set after save</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="submit"
                        className="bg-[#0D7377] text-white hover:bg-[#0b6669]"
                        disabled={moleculeSaving}
                        onClick={() => setMoleculeSubmitMode("save")}
                      >
                        {moleculeSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save
                      </Button>
                      <Button
                        type="submit"
                        variant="outline"
                        className="border-gray-300"
                        disabled={moleculeSaving}
                        onClick={() => setMoleculeSubmitMode("save-add-another")}
                      >
                        Save and add another
                      </Button>
                      <Button
                        type="submit"
                        variant="outline"
                        className="border-gray-300"
                        disabled={moleculeSaving}
                        onClick={() => setMoleculeSubmitMode("save-continue")}
                      >
                        Save and continue editing
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </form>
            )}
          </div>
        ) : null}

        {activeTab === "categories" ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Categories</h2>
                <p className="mt-1 text-sm text-gray-500">Manage product categories with inline editing.</p>
              </div>
              <Button className="bg-[#0D7377] text-white hover:bg-[#0b6669]" onClick={beginAddCategory}>
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </div>

            <BannerNotice banner={categoryBanner} />

            {categoriesState === "loading" ? (
              <TableSkeleton columns={3} />
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Slug</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isAddingCategory ? (
                      <tr className="bg-[#0D7377]/5">
                        <td colSpan={4} className="px-6 py-4">
                          <form onSubmit={saveCategory} className="grid gap-4 lg:grid-cols-[1fr_1fr_1.5fr_auto] lg:items-start">
                            <Input
                              value={categoryForm.name}
                              onChange={(event) =>
                                setCategoryForm((current) => ({
                                  ...current,
                                  name: event.target.value,
                                  slug: slugify(event.target.value),
                                }))
                              }
                              placeholder="Category name"
                              className={fieldClassName}
                            />
                            <Input
                              value={categoryForm.slug}
                              onChange={(event) => setCategoryForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
                              placeholder="category-slug"
                              className={fieldClassName}
                            />
                            <Input
                              value={categoryForm.description}
                              onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))}
                              placeholder="Description"
                              className={fieldClassName}
                            />
                            <div className="flex gap-2">
                              <Button type="submit" className="bg-[#0D7377] text-white hover:bg-[#0b6669]" disabled={categorySaving}>
                                {categorySaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                              </Button>
                              <Button type="button" variant="outline" className="border-gray-300" onClick={resetCategoryEditor}>
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    ) : null}

                    {categories.map((category) => (
                      <Fragment key={category.id}>
                        <tr>
                          <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{category.slug}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{category.description || "No description"}</td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" className="border-gray-300" onClick={() => beginEditCategory(category)}>
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Button>
                              <Button type="button" variant="outline" className="border-gray-300" onClick={() => deleteCategory(category.id)}>
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {editingCategoryId === category.id ? (
                          <tr className="bg-[#0D7377]/5">
                            <td colSpan={4} className="px-6 py-4">
                              <form onSubmit={saveCategory} className="grid gap-4 lg:grid-cols-[1fr_1fr_1.5fr_auto] lg:items-start">
                                <Input
                                  value={categoryForm.name}
                                  onChange={(event) =>
                                    setCategoryForm((current) => ({
                                      ...current,
                                      name: event.target.value,
                                      slug: slugify(event.target.value),
                                    }))
                                  }
                                  className={fieldClassName}
                                />
                                <Input
                                  value={categoryForm.slug}
                                  onChange={(event) => setCategoryForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
                                  className={fieldClassName}
                                />
                                <Input
                                  value={categoryForm.description}
                                  onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))}
                                  className={fieldClassName}
                                />
                                <div className="flex gap-2">
                                  <Button type="submit" className="bg-[#0D7377] text-white hover:bg-[#0b6669]" disabled={categorySaving}>
                                    {categorySaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                                  </Button>
                                  <Button type="button" variant="outline" className="border-gray-300" onClick={resetCategoryEditor}>
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}

        {activeTab === "contacts" ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Contacts</h2>
              <p className="mt-1 text-sm text-gray-500">Manage the live frontend contact details and review incoming submissions.</p>
            </div>

            {contactConfigState === "loading" ? (
              <TableSkeleton columns={3} />
            ) : (
              <ContactConfigManager contactConfig={contactConfig} onUpdate={loadContactConfig} />
            )}

            {contactsState === "loading" ? (
              <TableSkeleton columns={4} />
            ) : contacts.length === 0 ? (
              <EmptyState icon={Mail} title="No contact submissions" description="When visitors submit the contact or quote forms, rows will appear here." />
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Message</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {contacts.map((contact) => (
                      <tr key={contact.id}>
                        <td className="px-6 py-4 font-medium text-gray-900">{contact.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{contact.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{contact.message}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(contact.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}

        {activeTab === "settings" ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
              <p className="mt-1 text-sm text-gray-500">Change the admin password from here.</p>
            </div>

            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Use a strong password with at least 8 characters. After your first successful password update, admin login
                  will use the database-backed password instead of the temporary environment fallback.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <BannerNotice banner={passwordBanner} />
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <PasswordField
                    id="current-password"
                    label="Current Password"
                    value={currentPassword}
                    shown={passwordVisibility.current}
                    onChange={setCurrentPassword}
                    onToggle={() =>
                      setPasswordVisibility((current) => ({
                        ...current,
                        current: !current.current,
                      }))
                    }
                  />
                  <PasswordField
                    id="new-password"
                    label="New Password"
                    value={newPassword}
                    shown={passwordVisibility.next}
                    onChange={setNewPassword}
                    onToggle={() =>
                      setPasswordVisibility((current) => ({
                        ...current,
                        next: !current.next,
                      }))
                    }
                  />
                  <PasswordField
                    id="confirm-password"
                    label="Confirm Password"
                    value={confirmPassword}
                    shown={passwordVisibility.confirm}
                    onChange={setConfirmPassword}
                    onToggle={() =>
                      setPasswordVisibility((current) => ({
                        ...current,
                        confirm: !current.confirm,
                      }))
                    }
                  />

                  <div className="border-t border-gray-200 pt-5 md:pl-[220px]">
                    <div className="mb-3 text-xs leading-5 text-gray-500">
                      Current password is required. New password and confirm password must match before submission.
                    </div>
                    <Button type="submit" className="bg-[#0D7377] text-white hover:bg-[#0b6669]" disabled={passwordSaving}>
                      {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>

      {historyState ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-gray-950/50 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0D7377]">{historyState.kind}</p>
                <h3 className="mt-2 text-xl font-semibold text-gray-900">{historyState.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setHistoryState(null)}
                className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="mt-6 space-y-3 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-900">Created At:</span> {formatDate(historyState.createdAt)}
              </p>
              <p>
                <span className="font-medium text-gray-900">Last Updated:</span> {formatDate(historyState.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
