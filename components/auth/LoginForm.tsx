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
import { ROLE_HOME, VERIFICATION_ROUTE } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
      .select("role, verification_status")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      toast.error(
        `Profil tidak terbaca: ${profileError?.message ?? "data kosong"}`,
      );
      return;
    }

    const destination =
      profile.verification_status === "verified"
        ? ROLE_HOME[profile.role]
        : VERIFICATION_ROUTE;

    toast.success("Berhasil masuk");
    router.replace(destination);
    router.refresh();
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold tracking-tight text-brand-ink">
        Masuk
      </h1>
      <p className="mt-2 text-sm text-brand-ink/55">
        Lanjutkan menyalurkan atau menerima donasi hari ini.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-brand-ink">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nama@contoh.com"
            className="h-11 bg-white"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-sm text-red-700">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-brand-ink">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-11 bg-white pr-12"
              {...register("password")}
            />
            <button
              type="button"
              aria-label={
                isPasswordVisible ? "Sembunyikan password" : "Tampilkan password"
              }
              aria-pressed={isPasswordVisible}
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-md text-brand-ink/35 transition-colors hover:text-brand"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-[18px]"
                aria-hidden
              >
                <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
                <circle cx="12" cy="12" r="3" />
                {isPasswordVisible ? <path d="M4 20 20 4" /> : null}
              </svg>
            </button>
          </div>
          {errors.password ? (
            <p className="text-sm text-red-700">{errors.password.message}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 h-11 text-base"
        >
          {isSubmitting ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-brand-ink/55">
        Belum punya akun?{" "}
        <Link
          href="/choose-role"
          className="font-semibold text-brand underline underline-offset-2"
        >
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
