"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      setIsLoggedIn(true);
      api.get("/api/user/")
        .then((res) => setIsAdmin(Boolean(res.data.is_superuser)))
        .catch(() => setIsAdmin(false));
      api.get("/api/products/")
        .then(res => setProducts(res.data))
        .catch(err => {
          console.error("Error fetching products:", err);
          if (err.response?.status === 401) {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            setIsLoggedIn(false);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
    setProducts([]);
    setDropdownOpen(false);
    window.location.href = "/"; // Redireciona para a home após logout
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-slate-100">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="site-shell" id="top">
      {/* Header */}
      <header className="site-header fixed top-0 z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="site-brand brand-font text-2xl font-bold transition-colors hover:text-sky-200">
            Rede Numenor
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="#top" className="site-nav-link transition-colors">
              Início
            </Link>
            <Link href="/loja" className="site-nav-link transition-colors">
              Loja
            </Link>
            <div className="relative">
              {isLoggedIn ? (
                <div>
                  <button
                    onClick={toggleDropdown}
                    className="site-profile-button flex items-center space-x-2 rounded-xl px-4 py-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span>Perfil</span>
                  </button>
                  {dropdownOpen && (
                    <div className="site-dropdown absolute right-0 z-20 mt-2 w-48 rounded-2xl">
                      <div className="py-1">
                        <Link
                          href="/meus-dados"
                          className="site-dropdown-link block w-full px-4 py-2 text-left text-sm"
                        >
                          Meus dados
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/painel-anuncios"
                            className="site-dropdown-link block w-full px-4 py-2 text-left text-sm"
                          >
                            Gerenciar anúncios
                          </Link>
                        )}
                        <button
                          onClick={() => alert('Compras - Em breve!')}
                          className="site-dropdown-link block w-full px-4 py-2 text-left text-sm"
                        >
                          Compras
                        </button>
                        <button
                          onClick={handleLogout}
                          className="site-dropdown-link block w-full px-4 py-2 text-left text-sm"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-x-2">
                  <Link
                    href="/login"
                    className="site-accent-button rounded-xl px-4 py-2 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="site-success-button rounded-xl px-4 py-2 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex h-screen shrink-0 items-center justify-center bg-[linear-gradient(140deg,rgba(8,18,36,0.98)_10%,rgba(15,30,57,0.94)_50%,rgba(11,80,96,0.72)_100%)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Bem-vindo à Rede Numenor
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-2xl text-slate-200 sm:text-3xl">
            {isLoggedIn
              ? "Sua jornada na Rede Numenor começa aqui!"
              : "Faça login para descobrir produtos incríveis e ofertas especiais."
            }
          </p>
          {!isLoggedIn && (
            <div className="mt-8">
              <Link
                href="/login"
                className="site-accent-button rounded-2xl px-6 py-3 text-lg font-medium transition-colors"
              >
                Fazer Login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Loja Section */}
      <div className="shrink-0 py-16 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="site-panel mt-8 rounded-[2rem] px-6 py-12">
            <h2 className="text-3xl font-bold text-slate-50">Loja</h2>
            <p className="site-muted mt-4">Explore nossa loja e descubra produtos incríveis!</p>
            <Link
              href="/loja"
              className="site-accent-button mt-4 inline-block rounded-2xl px-6 py-3 text-lg font-medium transition-colors"
            >
              Acessar Loja
            </Link>
          </div>
        </div>
      </div>

      {/* Discord Section */}
      <div className="shrink-0 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-[2rem] border border-cyan-500/20 bg-[linear-gradient(140deg,rgba(12,24,46,0.94),rgba(8,76,93,0.76))] px-6 py-12 shadow-[0_30px_80px_rgba(4,12,20,0.32)]">
            <h2 className="text-3xl font-bold text-white">Discord</h2>
            <p className="mt-4 text-slate-200">Conecte-se com outros jogadores, participe de discussões e fique por dentro das novidades!</p>
            <a
              href="https://discord.gg/UTzZEJ2aZ8"
              target="_blank"
              rel="noopener noreferrer"
              className="site-accent-button mt-4 inline-block rounded-2xl px-6 py-3 text-lg font-medium transition-colors"
            >
              Entrar no Discord
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="site-footer mt-auto text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-slate-300">&copy; 2026 Rede Numenor. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
