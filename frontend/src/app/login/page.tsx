"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "../../services/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(username, password);
      router.push("/");
    } catch (err) {
      setError("Erro no login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-12">
      <div className="site-panel w-full max-w-md rounded-3xl p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-slate-50">Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-200">
              Usuário
            </label>
            <input
              id="username"
              type="text"
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="site-input mt-1 block w-full rounded-xl px-3 py-2.5 shadow-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-200">
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="site-input mt-1 block w-full rounded-xl px-3 py-2.5 shadow-sm"
              required
            />
          </div>

          {error && (
            <div className="text-center text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="site-accent-button w-full rounded-xl px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-sky-300 transition-colors hover:text-sky-200">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}