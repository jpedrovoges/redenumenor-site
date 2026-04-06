"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";

export default function MeusDados() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState({ firstName: '', username: '', email: '' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/login");
    } else {
      setIsLoggedIn(true);
      // Fetch user data
      api.get("/api/user/")
        .then(res => {
          setUserData({ firstName: res.data.first_name, username: res.data.username, email: res.data.email });
          setIsAdmin(Boolean(res.data.is_superuser));
        })
        .catch(err => {
          console.error("Error fetching user data:", err);
          if (err.response?.status === 401) {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            router.push("/login");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
    setDropdownOpen(false);
    router.push("/login");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access");

    if (showPasswordChange) {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert("As novas senhas não coincidem.");
        return;
      }
      // Change password
      api.put("/api/change-password/", {
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword,
      })
        .then(() => {
          alert("Senha alterada com sucesso!");
          setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
          setShowPasswordChange(false);
        })
        .catch(err => {
          console.error("Error changing password:", err);
          alert("Erro ao alterar senha. Verifique a senha atual.");
        });
    } else {
      // Update user data
      api.put("/api/user/", {
        first_name: userData.firstName,
        username: userData.username,
        email: userData.email,
      })
        .then(() => alert("Dados atualizados com sucesso!"))
        .catch(err => {
          console.error("Error updating user data:", err);
          alert("Erro ao atualizar dados.");
        });
    }
  };

  if (!isLoggedIn || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-slate-100">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="site-shell">
      {/* Header */}
      <header className="site-header fixed top-0 z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="site-brand brand-font text-2xl font-bold transition-colors hover:text-sky-200">
            Rede Numenor
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/" className="site-nav-link transition-colors">
              Início
            </Link>
            <Link href="/loja" className="site-nav-link transition-colors">
              Loja
            </Link>
            <div className="relative">
              {isLoggedIn && (
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
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        <h2 className="mb-8 text-3xl font-bold text-slate-50">Meus Dados</h2>
        <form onSubmit={handleSubmit} className="site-panel mx-auto max-w-md rounded-3xl p-6">
          <div className="mb-4">
            <label className="block text-slate-200">Nome</label>
            <input
              type="text"
              value={userData.firstName}
              onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
              className="site-input w-full rounded-xl px-3 py-2.5"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-slate-200">Usuário</label>
            <input
              type="text"
              value={userData.username}
              onChange={(e) => setUserData({ ...userData, username: e.target.value })}
              className="site-input w-full rounded-xl px-3 py-2.5"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-slate-200">Email</label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              className="site-input w-full rounded-xl px-3 py-2.5"
              required
            />
          </div>
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="w-full rounded-xl border border-white/12 bg-white/4 py-2.5 text-white transition-colors hover:bg-white/8"
            >
              {showPasswordChange ? 'Cancelar Troca de Senha' : 'Trocar Senha'}
            </button>
          </div>
          {showPasswordChange && (
            <>
              <div className="mb-4">
                <label className="block text-slate-200">Senha Atual</label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  className="site-input w-full rounded-xl px-3 py-2.5"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-slate-200">Nova Senha</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="site-input w-full rounded-xl px-3 py-2.5"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-slate-200">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="site-input w-full rounded-xl px-3 py-2.5"
                  required
                />
              </div>
            </>
          )}
          <button type="submit" className="site-accent-button w-full rounded-xl py-2.5">
            Salvar Alterações
          </button>
        </form>
      </main>

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