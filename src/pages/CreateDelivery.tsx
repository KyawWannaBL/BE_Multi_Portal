import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateDeliveryForm } from "@/features/delivery/hooks/useCreateDeliveryForm";

export default function CreateDelivery() {
  const {
    form,
    errors,
    saving,
    lastSavedId,
    totalQty,
    totalWeight,
    setField,
    setItemField,
    addItem,
    removeItem,
    resetForm,
    save,
    copyPayload,
  } = useCreateDeliveryForm();

  async function handleSave() {
    const result = await save();
    if (result) {
      window.alert(`Delivery created successfully. ID: ${result.id}`);
    }
  }

  return (
    <div className="animate-in fade-in space-y-6 p-6 md:p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">
            CREATE DELIVERY
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Create and register new delivery records.
          </p>
          <p className="mt-2 text-[10px] font-mono uppercase tracking-wider text-emerald-400">
            SUBMIT ENDPOINT : /API/ADMIN/CREATE-DELIVERY
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 text-white hover:bg-emerald-500"
          >
            {saving ? "SAVING..." : "SAVE"}
          </Button>

          <Button
            variant="outline"
            onClick={resetForm}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            RESET
          </Button>

          <Button
            variant="outline"
            onClick={copyPayload}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            COPY PAYLOAD
          </Button>
        </div>
      </div>

      {lastSavedId ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          Saved successfully. Delivery ID: <span className="font-bold">{lastSavedId}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-[#0A0E17] p-5 shadow-2xl">
          <div className="mb-4 text-lg font-black uppercase tracking-wide text-white">
            Sender / Pickup
          </div>

          <div className="grid gap-3">
            <Input
              value={form.merchantName || ""}
              onChange={(e) => setField("merchantName", e.target.value)}
              placeholder="Merchant name"
              className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
            />

            <Input
              value={form.senderName || ""}
              onChange={(e) => setField("senderName", e.target.value)}
              placeholder="Sender name"
              className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
            />

            <Input
              value={form.senderPhone || ""}
              onChange={(e) => setField("senderPhone", e.target.value)}
              placeholder="Sender phone"
              className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
            />

            <Input
              value={form.pickupAddress || ""}
              onChange={(e) => setField("pickupAddress", e.target.value)}
              placeholder="Pickup address"
              className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
            />

            <Input
              value={form.pickupTownship || ""}
              onChange={(e) => setField("pickupTownship", e.target.value)}
              placeholder="Pickup township"
              className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0A0E17] p-5 shadow-2xl">
          <div className="mb-4 text-lg font-black uppercase tracking-wide text-white">
            Receiver / Delivery
          </div>

          <div className="grid gap-3">
            <div>
              <Input
                value={form.receiverName}
                onChange={(e) => setField("receiverName", e.target.value)}
                placeholder="Receiver name"
                className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
              />
              {errors.receiverName ? (
                <div className="mt-1 text-xs text-rose-400">{errors.receiverName}</div>
              ) : null}
            </div>

            <div>
              <Input
                value={form.receiverPhone}
                onChange={(e) => setField("receiverPhone", e.target.value)}
                placeholder="Receiver phone"
                className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
              />
              {errors.receiverPhone ? (
                <div className="mt-1 text-xs text-rose-400">{errors.receiverPhone}</div>
              ) : null}
            </div>

            <div>
              <Input
                value={form.deliveryAddress}
                onChange={(e) => setField("deliveryAddress", e.target.value)}
                placeholder="Delivery address"
                className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
              />
              {errors.deliveryAddress ? (
                <div className="mt-1 text-xs text-rose-400">{errors.deliveryAddress}</div>
              ) : null}
            </div>

            <Input
              value={form.deliveryTownship || ""}
              onChange={(e) => setField("deliveryTownship", e.target.value)}
              placeholder="Delivery township"
              className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0A0E17] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="text-lg font-black uppercase tracking-wide text-white">
            Parcel Items
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {form.items.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-2xl border border-white/5 bg-black/20 p-4 xl:grid-cols-7"
            >
              <div className="xl:col-span-2">
                <Input
                  value={item.description}
                  onChange={(e) =>
                    setItemField(index, "description", e.target.value)
                  }
                  placeholder="Description"
                  className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
                />
                {errors[`items.${index}.description`] ? (
                  <div className="mt-1 text-xs text-rose-400">
                    {errors[`items.${index}.description`]}
                  </div>
                ) : null}
              </div>

              <div>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    setItemField(index, "quantity", Number(e.target.value))
                  }
                  placeholder="Qty"
                  className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
                />
                {errors[`items.${index}.quantity`] ? (
                  <div className="mt-1 text-xs text-rose-400">
                    {errors[`items.${index}.quantity`]}
                  </div>
                ) : null}
              </div>

              <div>
                <Input
                  type="number"
                  value={item.weightKg || 0}
                  onChange={(e) =>
                    setItemField(index, "weightKg", Number(e.target.value))
                  }
                  placeholder="Weight (kg)"
                  className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <Input
                  type="number"
                  value={item.lengthCm || 0}
                  onChange={(e) =>
                    setItemField(index, "lengthCm", Number(e.target.value))
                  }
                  placeholder="Length"
                  className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <Input
                  type="number"
                  value={item.widthCm || 0}
                  onChange={(e) =>
                    setItemField(index, "widthCm", Number(e.target.value))
                  }
                  placeholder="Width"
                  className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <Input
                  type="number"
                  value={item.heightCm || 0}
                  onChange={(e) =>
                    setItemField(index, "heightCm", Number(e.target.value))
                  }
                  placeholder="Height"
                  className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="xl:col-span-2">
                <Input
                  type="number"
                  value={item.declaredValue || 0}
                  onChange={(e) =>
                    setItemField(index, "declaredValue", Number(e.target.value))
                  }
                  placeholder="Declared value"
                  className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="xl:col-span-5" />

              <div className="xl:col-span-2 flex justify-end">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeItem(index)}
                  className="bg-rose-600 hover:bg-rose-500"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Input
            value={form.serviceType || ""}
            onChange={(e) => setField("serviceType", e.target.value)}
            placeholder="Service type"
            className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
          />

          <Input
            value={form.paymentType || ""}
            onChange={(e) => setField("paymentType", e.target.value)}
            placeholder="Payment type"
            className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
          />

          <Input
            type="number"
            value={form.codAmount || 0}
            onChange={(e) => setField("codAmount", Number(e.target.value))}
            placeholder="COD amount"
            className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
          />

          <Input
            type="number"
            value={form.deliveryFee || 0}
            onChange={(e) => setField("deliveryFee", Number(e.target.value))}
            placeholder="Delivery fee"
            className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Input
            value={form.priority || ""}
            onChange={(e) => setField("priority", e.target.value as any)}
            placeholder="Priority"
            className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
          />

          <Input
            type="datetime-local"
            value={form.scheduledAt || ""}
            onChange={(e) => setField("scheduledAt", e.target.value || null)}
            className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
          />

          <Input
            value={form.note || ""}
            onChange={(e) => setField("note", e.target.value)}
            placeholder="Note"
            className="border-white/10 bg-black/30 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-gray-300">
          <div>Total Quantity: <span className="font-bold text-white">{totalQty}</span></div>
          <div className="mt-1">
            Total Weight: <span className="font-bold text-white">{totalWeight} kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}