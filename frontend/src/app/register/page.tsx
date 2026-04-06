"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "../../services/auth";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      await register(firstName, username, email, password);
      router.push("/");
    } catch (err: any) {
      if (err.response?.data) {
        const errors = err.response.data;
        if (errors.username) {
          setError(Array.isArray(errors.username) ? errors.username[0] : errors.username);
        } else if (errors.email) {
          setError(Array.isArray(errors.email) ? errors.email[0] : errors.email);
        } else if (errors.password) {
          setError(Array.isArray(errors.password) ? errors.password[0] : errors.password);
        } else if (errors.first_name) {
          setError(Array.isArray(errors.first_name) ? errors.first_name[0] : errors.first_name);
        } else if (errors.error) {
          setError(errors.error);
        } else {
          setError("Erro ao cadastrar. Verifique os dados.");
        }
      } else {
        setError("Erro de conexão. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-12">
      <div className="site-panel w-full max-w-md rounded-3xl p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-slate-50">Cadastro</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-200">
              Nome
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="Digite seu nome"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="site-input mt-1 block w-full rounded-xl px-3 py-2.5 shadow-sm"
              required
            />
          </div>

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
            <label htmlFor="email" className="block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200">
              Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            className="site-success-button w-full rounded-xl px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-sky-300 transition-colors hover:text-sky-200">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}