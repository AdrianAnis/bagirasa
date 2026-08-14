"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";

import { ChipGroup } from "@/components/shared/ChipGroup";
import { Field } from "@/components/shared/Field";
import { SwitchField } from "@/components/shared/SwitchField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BASE_ALLERGENS } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  donationCreateSchema,
  FOOD_TYPE_LABEL,
  FOOD_TYPES,
  type DonationCreateInput,
  type FoodItemInput,
} from "@/lib/validations/donation";

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

const EMPTY_ITEM: FoodItemInput = {
  name: "",
  foodType: "makanan_berat",
  shelfLifeHours: 6,
  isHalal: true,
  ingredients: "",
  allergens: [],
  quantity: 1,
  unit: "porsi",
  servings: 1,
};

export function DonationForm() {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DonationCreateInput>({
    resolver: zodResolver(donationCreateSchema),
    defaultValues: { notes: "", items: [EMPTY_ITEM] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" });

  const totalServings = (items ?? []).reduce(
    (total, item) => total + (Number(item?.servings) || 0),
    0,
  );

  async function onSubmit(values: DonationCreateInput) {
    const response = await fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error ?? "Gagal menyimpan donasi");
      return;
    }

    toast.success("Donasi tersimpan");
    router.replace("/donor");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {fields.map((field, index) => (
        <section
          key={field.id}
          className="rounded-xl border border-brand-ink/10 bg-white p-5"
        >
          <div className="flex items-center justify-between gap-4 border-b border-brand-ink/10 pb-4">
            <h2 className="eyebrow text-brand/70">Item {index + 1}</h2>
            {fields.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="text-brand-ink/50 hover:text-red-700"
              >
                Hapus item
              </Button>
            ) : null}
          </div>

          <div className="flex flex-col gap-5 pt-5">
            <Field
              label="Nama makanan"
              htmlFor={`items.${index}.name`}
              error={errors.items?.[index]?.name?.message}
            >
              <Input
                id={`items.${index}.name`}
                {...register(`items.${index}.name`)}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Jenis makanan" htmlFor={`items.${index}.foodType`}>
                <select
                  id={`items.${index}.foodType`}
                  className={SELECT_CLASS}
                  {...register(`items.${index}.foodType`)}
                >
                  {FOOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {FOOD_TYPE_LABEL[type]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Ketahanan (jam)"
                htmlFor={`items.${index}.shelfLifeHours`}
                error={errors.items?.[index]?.shelfLifeHours?.message}
              >
                <Input
                  id={`items.${index}.shelfLifeHours`}
                  type="number"
                  min={1}
                  max={168}
                  {...register(`items.${index}.shelfLifeHours`, {
                    valueAsNumber: true,
                  })}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field
                label="Kuantitas"
                htmlFor={`items.${index}.quantity`}
                error={errors.items?.[index]?.quantity?.message}
              >
                <Input
                  id={`items.${index}.quantity`}
                  type="number"
                  min={1}
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                />
              </Field>

              <Field
                label="Satuan"
                htmlFor={`items.${index}.unit`}
                error={errors.items?.[index]?.unit?.message}
              >
                <Input
                  id={`items.${index}.unit`}
                  {...register(`items.${index}.unit`)}
                />
              </Field>

              <Field
                label="Estimasi porsi"
                htmlFor={`items.${index}.servings`}
                error={errors.items?.[index]?.servings?.message}
              >
                <Input
                  id={`items.${index}.servings`}
                  type="number"
                  min={1}
                  {...register(`items.${index}.servings`, {
                    valueAsNumber: true,
                  })}
                />
              </Field>
            </div>

            <p className="rounded-lg bg-canvas px-3 py-2 text-sm text-brand-ink/55">
              Kuantitas adalah cara makanan dikemas (2 tray, 5 box). Estimasi
              porsi adalah berapa orang yang bisa dikenyangkan — angka inilah
              yang dipakai membagi donasi ke penerima.
            </p>

            <Field
              label="Bahan yang digunakan"
              htmlFor={`items.${index}.ingredients`}
              error={errors.items?.[index]?.ingredients?.message}
            >
              <Textarea
                id={`items.${index}.ingredients`}
                rows={3}
                placeholder="Contoh: ayam, tepung terigu, telur, minyak goreng"
                {...register(`items.${index}.ingredients`)}
              />
            </Field>

            <Field
              label="Alergen"
              hint="Pilih alergen yang terkandung. Penerima dengan pantangan ini tidak akan dicocokkan dengan donasi tersebut."
            >
              <Controller
                control={control}
                name={`items.${index}.allergens`}
                render={({ field }) => (
                  <ChipGroup
                    label="Alergen"
                    options={BASE_ALLERGENS}
                    value={field.value as (typeof BASE_ALLERGENS)[number][]}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>

            <Controller
              control={control}
              name={`items.${index}.isHalal`}
              render={({ field }) => (
                <SwitchField
                  id={`items.${index}.isHalal`}
                  label="Makanan ini halal"
                  description="Matikan bila mengandung bahan non-halal."
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </section>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append(EMPTY_ITEM)}
        className="w-full border-dashed"
      >
        Tambah item makanan
      </Button>

      <section className="rounded-xl border border-brand-ink/10 bg-white p-5">
        <Field
          label="Catatan untuk penerima"
          htmlFor="notes"
          error={errors.notes?.message}
        >
          <Textarea
            id="notes"
            rows={2}
            placeholder="Contoh: bisa diambil sebelum pukul 21.00"
            {...register("notes")}
          />
        </Field>
      </section>

      <div
        className={cn(
          "flex items-baseline justify-between gap-4 rounded-xl border px-5 py-4",
          totalServings > 0
            ? "border-brand bg-brand-tint/40"
            : "border-brand-ink/10 bg-white",
        )}
      >
        <span className="text-sm text-brand-ink/55">Total porsi donasi</span>
        <span className="flex items-baseline gap-2">
          <span className="numeric text-2xl font-semibold text-brand-ink">
            {totalServings}
          </span>
          <span className="text-sm text-brand-ink/55">porsi</span>
        </span>
      </div>

      {errors.items?.root ? (
        <p className="text-sm text-red-700">{errors.items.root.message}</p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} size="lg">
        {isSubmitting ? "Menyimpan..." : "Simpan donasi"}
      </Button>
    </form>
  );
}
