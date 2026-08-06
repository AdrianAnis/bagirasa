"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-col gap-4 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold">Item {index + 1}</h2>
            {fields.length > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => remove(index)}
              >
                Hapus
              </Button>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`items.${index}.name`}>Nama makanan</Label>
            <Input
              id={`items.${index}.name`}
              {...register(`items.${index}.name`)}
            />
            {errors.items?.[index]?.name ? (
              <p className="text-sm text-destructive">
                {errors.items[index]?.name?.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`items.${index}.foodType`}>Jenis makanan</Label>
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
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor={`items.${index}.shelfLifeHours`}>
                Ketahanan (jam)
              </Label>
              <Input
                id={`items.${index}.shelfLifeHours`}
                type="number"
                min={1}
                max={168}
                {...register(`items.${index}.shelfLifeHours`, {
                  valueAsNumber: true,
                })}
              />
              {errors.items?.[index]?.shelfLifeHours ? (
                <p className="text-sm text-destructive">
                  {errors.items[index]?.shelfLifeHours?.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`items.${index}.quantity`}>Kuantitas</Label>
              <Input
                id={`items.${index}.quantity`}
                type="number"
                min={1}
                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
              />
              {errors.items?.[index]?.quantity ? (
                <p className="text-sm text-destructive">
                  {errors.items[index]?.quantity?.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor={`items.${index}.unit`}>Satuan</Label>
              <Input
                id={`items.${index}.unit`}
                {...register(`items.${index}.unit`)}
              />
              {errors.items?.[index]?.unit ? (
                <p className="text-sm text-destructive">
                  {errors.items[index]?.unit?.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor={`items.${index}.servings`}>Estimasi porsi</Label>
              <Input
                id={`items.${index}.servings`}
                type="number"
                min={1}
                {...register(`items.${index}.servings`, { valueAsNumber: true })}
              />
              {errors.items?.[index]?.servings ? (
                <p className="text-sm text-destructive">
                  {errors.items[index]?.servings?.message}
                </p>
              ) : null}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Kuantitas adalah cara makanan dikemas (mis. 2 tray, 5 box).
            Estimasi porsi adalah berapa orang yang bisa dikenyangkan — angka
            inilah yang dipakai membagi donasi ke penerima.
          </p>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`items.${index}.ingredients`}>
              Bahan yang digunakan
            </Label>
            <Textarea
              id={`items.${index}.ingredients`}
              rows={3}
              placeholder="Contoh: ayam, tepung terigu, telur, minyak goreng"
              {...register(`items.${index}.ingredients`)}
            />
            {errors.items?.[index]?.ingredients ? (
              <p className="text-sm text-destructive">
                {errors.items[index]?.ingredients?.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Alergen</Label>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {BASE_ALLERGENS.map((allergen) => (
                <label
                  key={allergen}
                  className="flex items-center gap-2 text-sm capitalize"
                >
                  <input
                    type="checkbox"
                    value={allergen}
                    className="size-4 accent-brand"
                    {...register(`items.${index}.allergens`)}
                  />
                  {allergen}
                </label>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Centang alergen yang terkandung. Penerima dengan pantangan ini
              tidak akan dicocokkan dengan donasi tersebut.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-brand"
              {...register(`items.${index}.isHalal`)}
            />
            Makanan ini halal
          </label>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append(EMPTY_ITEM)}
        className="w-full"
      >
        Tambah item makanan
      </Button>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Catatan untuk penerima</Label>
        <Textarea
          id="notes"
          rows={2}
          placeholder="Contoh: bisa diambil sebelum pukul 21.00"
          {...register("notes")}
        />
        {errors.notes ? (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        ) : null}
      </div>

      <div
        className={cn(
          "flex items-center justify-between rounded-lg border p-4",
          totalServings > 0 && "border-brand",
        )}
      >
        <span className="text-sm text-muted-foreground">Total porsi donasi</span>
        <span className="text-lg font-semibold text-brand">
          {totalServings} porsi
        </span>
      </div>

      {errors.items?.root ? (
        <p className="text-sm text-destructive">{errors.items.root.message}</p>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : "Simpan donasi"}
      </Button>
    </form>
  );
}
