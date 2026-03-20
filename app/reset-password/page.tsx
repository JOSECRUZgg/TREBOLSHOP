'use client';

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { newPassword } from "@/lib/password-actions";
import Link from "next/link";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    startTransition(() => {
      newPassword({ password }, token).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
      });
    });
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Restablecer Contraseña</CardTitle>
        <CardDescription className="text-center">
          Ingresa tu nueva contraseña a continuación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="password">Nueva Contraseña</label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="******"
              disabled={isPending}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Actualizando..." : "Restablecer contraseña"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          Volver al inicio de sesión
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Suspense fallback={<div>Cargando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
