"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        <h1 className="text-2xl font-semibold text-brand">Cek email kamu</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Kami mengirim tautan konfirmasi ke alamat email yang kamu daftarkan.
          Buka tautan itu untuk mengaktifkan akun, lalu masuk.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/login">Ke halaman masuk</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-sm flex-col gap-5"
    >
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-brand">Buat akun</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Mendaftar sebagai {ROLE_LABEL[role]}
          {recipientType ? ` — ${RECIPIENT_TYPE_LABEL[recipientType]}` : ""}.{" "}
          <Link href="/choose-role" className="underline">
            Ubah
          </Link>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">Ulangi password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      {errors.recipientType ? (
        <p className="text-sm text-destructive">
          {errors.recipientType.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Memproses..." : "Daftar"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-brand underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
