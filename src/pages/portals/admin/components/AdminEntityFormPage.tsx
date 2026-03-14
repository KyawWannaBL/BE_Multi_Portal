import React, { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, Send, RefreshCw, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { postJson, patchJson } from "@/features/admin-shell/api/http";

function initialValues(fields, seed = {}) {
  const next = {};
  (fields || []).forEach((field) => {
    const seeded = seed[field.key];
    next[field.key] =
      seeded !== undefined
        ? seeded
        : field.defaultValue ?? (field.type === "checkbox" ? false : "");
  });
  if (seed.id) next.id = seed.id;
  return next;
}

function Field({ field, value, onChange, language }) {
  const label = language === "en" ? field.labelEn : field.labelMy;
  const placeholder = language === "en" ? (field.placeholderEn || label) : (field.placeholderMy || label);
  const baseClass =
    "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500";

  if (field.type === "textarea") {
    return (
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={field.rows || 4}
        className={baseClass}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={baseClass}
      >
        <option value="">{placeholder}</option>
        {(field.options || []).map((option) => (
          <option key={option.value} value={option.value}>
            {language === "en" ? option.labelEn : option.labelMy}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{label}</span>
      </label>
    );
  }

  return (
    <input
      type={field.type || "text"}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={baseClass}
    />
  );
}

export default function AdminEntityFormPage({ config, initialData, mode = "create", onSuccess, onCancel }) {
  const { language, bi } = useLanguage();
  const [values, setValues] = useState(() => initialValues(config.formFields, initialData || {}));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValues(initialValues(config.formFields, initialData || {}));
  }, [JSON.stringify(initialData || {}), JSON.stringify(config.formFields || [])]);

  const titleBase = language === "en" ? config.titleEn : config.titleMy;
  const title = mode === "edit"
    ? `${bi("Edit", "ပြင်ဆင်ရန်")} - ${titleBase}`
    : titleBase;
  const description = language === "en" ? config.descriptionEn : config.descriptionMy;

  const groups = useMemo(() => {
    const grouped = {};
    (config.formFields || []).forEach((field) => {
      const key = field.group || "default";
      grouped[key] = grouped[key] || [];
      grouped[key].push(field);
    });
    return grouped;
  }, [config.formFields]);

  const validate = () => {
    for (const field of config.formFields || []) {
      if (!field.required) continue;
      const value = values[field.key];
      if (field.type === "checkbox") continue;
      if (value === undefined || value === null || String(value).trim() === "") {
        throw new Error(`${language === "en" ? field.labelEn : field.labelMy} ${bi("is required", "လိုအပ်ပါသည်")}`);
      }
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      validate();
      setSubmitting(true);
      const submitPath =
        mode === "edit"
          ? (config.updateEndpoint || config.endpoint)
          : config.endpoint;

      const result =
        mode === "edit"
          ? await patchJson(submitPath, values)
          : await postJson(submitPath, values);

      toast.success(
        mode === "edit"
          ? bi("Updated successfully.", "အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။")
          : bi("Saved successfully.", "အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။")
      );

      if (mode === "create" && config.resetAfterSubmit !== false) {
        setValues(initialValues(config.formFields));
      }

      onSuccess?.(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : bi("Submit failed.", "တင်ပို့မှု မအောင်မြင်ပါ။"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={onCancel ? "rounded-2xl border border-white/10 bg-[#0B101B] p-6" : "p-6 md:p-8 animate-in fade-in"}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-white">{title}</h2>
          <p className="mt-2 text-sm text-gray-400">{description}</p>
          <p className="mt-2 text-[10px] font-mono uppercase text-emerald-400">
            {bi(mode === "edit" ? "Update Endpoint" : "Submit Endpoint", mode === "edit" ? "ပြင်ဆင်မည့် Endpoint" : "ပို့မည့် Endpoint")} :
            {" "}
            {mode === "edit" ? (config.updateEndpoint || config.endpoint) : config.endpoint}
          </p>
        </div>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-white hover:bg-white/10"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      <form onSubmit={submit} className="space-y-6">
        {Object.entries(groups).map(([group, fields]) => (
          <div key={group} className="rounded-2xl border border-white/5 bg-[#0A0E17] p-5">
            {group !== "default" ? (
              <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                {group}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <div
                  key={field.key}
                  className={field.type === "textarea" ? "md:col-span-2" : ""}
                >
                  {field.type !== "checkbox" ? (
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                      {language === "en" ? field.labelEn : field.labelMy}
                    </label>
                  ) : null}
                  <Field
                    field={field}
                    value={values[field.key]}
                    onChange={(next) => setValues((prev) => ({ ...prev, [field.key]: next }))}
                    language={language}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black uppercase text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            <Send size={14} />
            {submitting
              ? bi(mode === "edit" ? "Updating..." : "Saving...", mode === "edit" ? "ပြင်ဆင်နေသည်..." : "သိမ်းဆည်းနေသည်...")
              : bi(mode === "edit" ? "Update" : "Save", mode === "edit" ? "ပြင်ဆင်ရန်" : "သိမ်းရန်")}
          </button>

          <button
            type="button"
            onClick={() => setValues(initialValues(config.formFields, initialData || {}))}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-black uppercase text-white hover:bg-white/10"
          >
            <RefreshCw size={14} />
            {bi("Reset", "ပြန်လည်သတ်မှတ်ရန်")}
          </button>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(values, null, 2));
              toast.success(bi("Payload copied.", "Payload ကို ကော်ပီကူးပြီးပါပြီ။"));
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-black uppercase text-white hover:bg-white/10"
          >
            <Save size={14} />
            {bi("Copy Payload", "Payload ကော်ပီ")}
          </button>
        </div>
      </form>
    </div>
  );
}
