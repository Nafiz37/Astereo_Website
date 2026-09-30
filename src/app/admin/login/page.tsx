import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { LogoMark } from "@/components/ui/logo";
import { adminConfigured, getAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="mx-auto mt-16 max-w-sm">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <LogoMark className="h-12 w-12" />
        <h1 className="text-2xl font-semibold">Astareo Admin</h1>
      </div>
      {!adminConfigured() && (
        <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          Admin is not configured. Set <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD_HASH</code> (see README), then redeploy.
        </p>
      )}
      <LoginForm />
    </div>
  );
}
