"use client";

import * as React from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const signupSuccess = searchParams.get("signup_success") === "true";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authClient.signIn.email({
        email,
        password,
      });

      if (res?.error) {
        setError(res.error.message || "Invalid email or password.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {signupSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-xs text-center font-sans">
          Registration successful! Please sign in.
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">
          Email Address
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">
          Password
        </label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={loading}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
          {error}
        </div>
      )}

      <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
        {loading ? "Signing In..." : "Sign In"}
      </Button>
    </form>
  );
}
