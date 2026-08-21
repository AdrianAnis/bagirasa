"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { ChipGroup } from "@/components/shared/ChipGroup";
import { Field } from "@/components/shared/Field";
import { SectionCard } from "@/components/shared/SectionCard";
import { SwitchField } from "@/components/shared/SwitchField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BASE_ALLERGENS } from "@/lib/config";
import {
  donationCreateSchema,
  FOOD_TYPE_LABEL,
  FOOD_TYPES,
  type DonationCreateInput,
  type FoodItemInput,
} from "@/lib/validations/donation";

const SELECT_CLASS =
  "h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 [&_input]:h-11"
    >
      {fields.map((field, index) => (
        <SectionCard
          key={field.id}
          title={`Item ${index + 1}`}
          action={
            fields.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="-mr-2 text-brand-ink/45 hover:text-red-600"
              >
                Hapus
              </Button>
            ) : null
          }
        >
          <div className="flex flex-col gap-5">
            <Field
              label="Nama makanan"
              htmlFor={`items.${index}.name`}
              error={errors.items?.[index]?.name?.message}
            >
              <Input
                id={`items.${index}.name`}
                placeholder="Contoh: Nasi ayam bakar"
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
                label="Ketahanan"
                htmlFor={`items.${index}.shelfLifeHours`}
                hint="Berapa jam lagi makanan ini masih aman dimakan."
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
                hint="Cara makanan dikemas."
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
                hint="Tray, box, porsi."
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
                hint="Berapa orang yang kenyang. Angka ini yang dibagi ke lembaga penerima."
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
              hint="Lembaga dengan pantangan ini tidak akan dicocokkan dengan donasimu."
            >
              <Controller
                control={control}
                name={`items.${index}.allergens`}
                render={({ field: allergenField }) => (
                  <ChipGroup
                    label="Alergen"
                    options={BASE_ALLERGENS}
                    value={
                      allergenField.value as (typeof BASE_ALLERGENS)[number][]
                    }
                    onChange={allergenField.onChange}
                  />
                )}
              />
            </Field>

            <Controller
              control={control}
              name={`items.${index}.isHalal`}
              render={({ field: halalField }) => (
                <SwitchField
                  id={`items.${index}.isHalal`}
                  label="Makanan ini halal"
                  description="Matikan bila mengandung bahan non-halal."
                  checked={halalField.value}
                  onCheckedChange={halalField.onChange}
                />
              )}
            />
          </div>
        </SectionCard>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append(EMPTY_ITEM)}
        className="h-12 w-full border-dashed text-brand-ink/60 hover:border-brand/50 hover:text-brand-ink"
      >
        <Plus className="size-4" aria-hidden />
        Tambah item makanan
      </Button>

      <div className="rounded-xl border border-brand-ink/8 bg-white p-5">
        <Field
          label="Catatan untuk penerima"
          htmlFor="notes"
          hint="Opsional. Waktu pengambilan, patokan lokasi, atau hal lain yang perlu diketahui lembaga penerima."
          error={errors.notes?.message}
        >
          <Textarea
            id="notes"
            rows={2}
            placeholder="Contoh: bisa diambil sebelum pukul 21.00"
            {...register("notes")}
          />
        </Field>
      </div>

      {errors.items?.root ? (
        <p className="text-sm font-medium text-red-600">
          {errors.items.root.message}
        </p>
      ) : null}

      <div className="sticky bottom-4 mt-2 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-ink/12 bg-white px-5 py-4 shadow-[0_2px_4px_rgba(16,36,28,0.06),0_18px_44px_-12px_rgba(16,36,28,0.32)]">
        <div>
          <p className="text-sm text-brand-ink/50">Total porsi donasi</p>
          <p className="mt-0.5">
            <span className="numeric text-2xl font-semibold text-brand-ink">
              {totalServings}
            </span>
            <span className="ml-1.5 text-sm text-brand-ink/45">porsi</span>
          </p>
        </div>

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan donasi"}
        </Button>
      </div>
    </form>
  );
}
