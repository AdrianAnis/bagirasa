"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Field } from "@/components/shared/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLE_HOME } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

const ROLE_LABEL: Record<RegisterInput["role"], string> = {
  donor: "Penyumbang",
  recipient: "Penerima",
};

const RECIPIENT_TYPE_LABEL: Record<
  NonNullable<RegisterInput["recipientType"]>,
  string
> = {
  panti_asuhan: "Panti Asuhan",
  rumah_lansia: "Rumah Lansia",
};

type RegisterFormProps = {
  role: RegisterInput["role"];
  recipientType?: RegisterInput["recipientType"];
};

export function RegisterForm({ role, recipientType }: RegisterFormProps) {
  const router = useRouter();
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role, recipientType },
  });

  async function onSubmit(values: RegisterInput) {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          role: values.role,
          recipient_type: values.recipientType ?? null,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    if (!data.session) {
      setAwaitingConfirmation(true);
      return;
    }

    toast.success("Pendaftaran berhasil");
    router.replace(ROLE_HOME[values.role]);
    router.refresh();
  }

  if (awaitingConfirmation) {
    return (
      <div className="w-full max-w-sm text-center">
        <p className="eyebrow text-brand/70">Satu langkah lagi</p>
        <h1 className="mt-2 text-title font-semibold text-brand-ink">
          Cek email kamu
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-brand-ink/55">
          Kami mengirim tautan konfirmasi ke alamat email yang kamu daftarkan.
          Buka tautan itu untuk mengaktifkan akun, lalu masuk.
        </p>
        <Button asChild className="mt-6 w-full" size="lg">
          <Link href="/login">Ke halaman masuk</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center">
        <p className="eyebrow text-brand/70">
          {ROLE_LABEL[role]}
          {recipientType ? ` · ${RECIPIENT_TYPE_LABEL[recipientType]}` : ""}
        </p>
        <h1 className="mt-2 text-title font-semibold text-brand-ink">
          Buat akun
        </h1>
        <p className="mt-2 text-sm text-brand-ink/55">
          Bukan peran yang kamu maksud?{" "}
          <Link href="/choose-role" className="underline">
            Ubah pilihan
          </Link>
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex flex-col gap-5 rounded-xl border border-brand-ink/10 bg-white p-6"
      >
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          hint="Minimal 8 karakter."
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
        </Field>

        <Field
          label="Ulangi password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
        </Field>

        {errors.recipientType ? (
          <p className="text-sm text-red-700">{errors.recipientType.message}</p>
        ) : null}

        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? "Memproses..." : "Daftar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-brand-ink/55">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-brand underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
