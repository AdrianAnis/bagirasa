"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Field } from "@/components/shared/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLE_HOME } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(
        error.code === "invalid_credentials"
          ? "Email atau password salah"
          : `Gagal masuk: ${error.message}`,
      );
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      toast.error(
        `Profil tidak terbaca: ${profileError?.message ?? "data kosong"}`,
      );
      return;
    }

    toast.success("Berhasil masuk");
    router.replace(ROLE_HOME[profile.role]);
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center">
        <p className="eyebrow text-brand/70">Masuk</p>
        <h1 className="mt-2 text-title font-semibold text-brand-ink">
          Selamat datang kembali
        </h1>
        <p className="mt-2 text-sm text-brand-ink/55">
          Gunakan email yang kamu daftarkan.
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
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
          />
        </Field>

        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-brand-ink/55">
        Belum punya akun?{" "}
        <Link href="/choose-role" className="font-medium text-brand underline">
          Daftar
        </Link>
      </p>
    </div>
  );
}
