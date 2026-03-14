import { useEffect, useMemo, useState } from "react";
import type {
  CreateDeliveryPayload,
  CreateDeliveryResponse,
  DeliveryLineItem,
} from "@/features/delivery/api/deliveryApi";
import { deliveryApi } from "@/features/delivery/api/deliveryApi";

const DRAFT_KEY = "create_delivery_draft_v1";

const createEmptyItem = (): DeliveryLineItem => ({
  description: "",
  quantity: 1,
  weightKg: 0,
  lengthCm: 0,
  widthCm: 0,
  heightCm: 0,
  declaredValue: 0,
});

const initialForm: CreateDeliveryPayload = {
  merchantId: "",
  merchantName: "",
  senderName: "",
  senderPhone: "",
  pickupAddress: "",
  pickupTownship: "",
  receiverName: "",
  receiverPhone: "",
  deliveryAddress: "",
  deliveryTownship: "",
  serviceType: "standard",
  paymentType: "prepaid",
  codAmount: 0,
  deliveryFee: 0,
  note: "",
  priority: "normal",
  scheduledAt: null,
  items: [createEmptyItem()],
};

type FieldErrors = Record<string, string>;

function safeNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeDraft(input: any): CreateDeliveryPayload {
  return {
    ...initialForm,
    ...input,
    items:
      Array.isArray(input?.items) && input.items.length > 0
        ? input.items.map((item: any) => ({
            ...createEmptyItem(),
            ...item,
            quantity: safeNumber(item?.quantity, 1),
            weightKg: safeNumber(item?.weightKg, 0),
            lengthCm: safeNumber(item?.lengthCm, 0),
            widthCm: safeNumber(item?.widthCm, 0),
            heightCm: safeNumber(item?.heightCm, 0),
            declaredValue: safeNumber(item?.declaredValue, 0),
          }))
        : [createEmptyItem()],
  };
}

export function useCreateDeliveryForm() {
  const [form, setForm] = useState<CreateDeliveryPayload>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [lastSavedId, setLastSavedId] = useState("");
  const [lastResponse, setLastResponse] = useState<CreateDeliveryResponse | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setForm(normalizeDraft(parsed));
    } catch {
      // ignore bad draft
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
      // ignore storage failure
    }
  }, [form]);

  const totalQty = useMemo(() => {
    return form.items.reduce((sum, item) => sum + safeNumber(item.quantity, 0), 0);
  }, [form.items]);

  const totalWeight = useMemo(() => {
    return form.items.reduce((sum, item) => sum + safeNumber(item.weightKg, 0), 0);
  }, [form.items]);

  function setField<K extends keyof CreateDeliveryPayload>(
    key: K,
    value: CreateDeliveryPayload[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function setItemField<K extends keyof DeliveryLineItem>(
    index: number,
    key: K,
    value: DeliveryLineItem[K]
  ) {
    setForm((prev) => {
      const nextItems = [...prev.items];
      nextItems[index] = {
        ...nextItems[index],
        [key]:
          key === "quantity" ||
          key === "weightKg" ||
          key === "lengthCm" ||
          key === "widthCm" ||
          key === "heightCm" ||
          key === "declaredValue"
            ? safeNumber(value, key === "quantity" ? 1 : 0)
            : value,
      };
      return { ...prev, items: nextItems };
    });

    setErrors((prev) => {
      const errorKey = `items.${index}.${String(key)}`;
      if (!prev[errorKey]) return prev;
      const next = { ...prev };
      delete next[errorKey];
      return next;
    });
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, createEmptyItem()],
    }));
  }

  function removeItem(index: number) {
    setForm((prev) => {
      const nextItems = prev.items.filter((_, i) => i !== index);
      return {
        ...prev,
        items: nextItems.length > 0 ? nextItems : [createEmptyItem()],
      };
    });

    setErrors((prev) => {
      const next: FieldErrors = {};
      Object.entries(prev).forEach(([key, value]) => {
        if (!key.startsWith(`items.${index}.`)) next[key] = value;
      });
      return next;
    });
  }

  function resetForm() {
    setForm(initialForm);
    setErrors({});
    setSaving(false);
    setLastSavedId("");
    setLastResponse(null);
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  }

  function validate(): boolean {
    const nextErrors: FieldErrors = {};

    if (!String(form.receiverName || "").trim()) {
      nextErrors.receiverName = "Receiver name is required.";
    }
    if (!String(form.receiverPhone || "").trim()) {
      nextErrors.receiverPhone = "Receiver phone is required.";
    }
    if (!String(form.deliveryAddress || "").trim()) {
      nextErrors.deliveryAddress = "Delivery address is required.";
    }
    if (!Array.isArray(form.items) || form.items.length === 0) {
      nextErrors.items = "At least one parcel item is required.";
    }

    form.items.forEach((item, index) => {
      if (!String(item.description || "").trim()) {
        nextErrors[`items.${index}.description`] = "Item description is required.";
      }
      if (safeNumber(item.quantity, 0) <= 0) {
        nextErrors[`items.${index}.quantity`] = "Quantity must be greater than 0.";
      }
    });

    if (safeNumber(form.codAmount, 0) < 0) {
      nextErrors.codAmount = "COD amount cannot be negative.";
    }
    if (safeNumber(form.deliveryFee, 0) < 0) {
      nextErrors.deliveryFee = "Delivery fee cannot be negative.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function save() {
    if (!validate()) return null;

    setSaving(true);
    try {
      const phoneCheck = await deliveryApi.validateReceiverPhone(form.receiverPhone);
      const normalizedPhone = phoneCheck?.normalized || form.receiverPhone;

      const payload: CreateDeliveryPayload = {
        ...form,
        receiverPhone: normalizedPhone,
        codAmount: safeNumber(form.codAmount, 0),
        deliveryFee: safeNumber(form.deliveryFee, 0),
        items: form.items.map((item) => ({
          ...item,
          quantity: safeNumber(item.quantity, 1),
          weightKg: safeNumber(item.weightKg, 0),
          lengthCm: safeNumber(item.lengthCm, 0),
          widthCm: safeNumber(item.widthCm, 0),
          heightCm: safeNumber(item.heightCm, 0),
          declaredValue: safeNumber(item.declaredValue, 0),
        })),
      };

      const result = await deliveryApi.createDelivery(payload);
      setLastSavedId(result.id || "");
      setLastResponse(result);

      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore
      }

      return result;
    } finally {
      setSaving(false);
    }
  }

  async function copyPayload() {
    await navigator.clipboard.writeText(JSON.stringify(form, null, 2));
  }

  return {
    form,
    errors,
    saving,
    lastSavedId,
    lastResponse,
    totalQty,
    totalWeight,
    setField,
    setItemField,
    addItem,
    removeItem,
    resetForm,
    validate,
    save,
    copyPayload,
  };
}

export default useCreateDeliveryForm;