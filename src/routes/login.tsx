import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/AuthLayout";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { apiRequest } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — HireFlow AI" },
      {
        name: "description",
        content:
          "Sign in to your HireFlow AI workspace and pick up your job search where you left off.",
      },
      { property: "og:title", content: "Sign in — HireFlow AI" },
      {
        property: "og:description",
        content:
          "Sign in to your HireFlow AI workspace and pick up your job search where you left off.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const data = await apiRequest<{
        token: string;
        user: { id: string; name: string; email: string };
      }>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Save JWT for authenticated requests
      localStorage.setItem("token", data.token);

      // Save basic user information
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate({
        to: "/dashboard",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to keep your applications moving."
      quote="I stopped losing track of deadlines. Every application, interview and follow-up lives in one place now."
      attribution="Ananya R., final-year CS student"
      footer={
        <>
          New to HireFlow AI?{" "}
          <Link
            to="/signup"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleLogin}>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-[oklch(0.52_0.13_200)]"
            />
            Remember me
          </label>

          <a
            href="/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Forgot password?
          </a>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="block" variant="primary" disabled={loading}>
          {loading ? "Signing in..." : "Log in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
