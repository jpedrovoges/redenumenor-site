"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { createProduct, deleteProduct, getProducts, updateProduct, type ProductPayload } from "@/services/products";
import { formatCurrency } from "@/lib/currency";
import { getDescriptionSegments } from "@/lib/product-description";

type Product = ProductPayload & {
  id: number;
  category_display?: string;
  image_url: string;
  active: boolean;
};

type AdminUser = {
  username: string;
  is_superuser: boolean;
};

const emptyForm: ProductPayload = {
  name: "",
  category: "vip",
  price: 0,
  description: "",
  image: null,
  active: true,
};

export default function PainelAnuncios() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<ProductPayload>(emptyForm);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const router = useRouter();

  const getErrorMessage = (apiError: unknown) => {
    if (typeof apiError === "string") {
      return apiError;
    }

    if (Array.isArray(apiError) && apiError.length > 0) {
      const firstItem = apiError[0];
      return typeof firstItem === "string" ? firstItem : "Não foi possível concluir a operação.";
    }

    if (apiError && typeof apiError === "object") {
      const errorRecord = apiError as Record<string, unknown>;
      const directMessage = errorRecord.detail ?? errorRecord.message ?? errorRecord.error;

      if (typeof directMessage === "string") {
        return directMessage;
      }

      for (const value of Object.values(errorRecord)) {
        if (typeof value === "string") {
          return value;
        }

        if (Array.isArray(value) && typeof value[0] === "string") {
          return value[0];
        }
      }
    }

    return "Não foi possível concluir a operação.";
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsLoggedIn(true);

    Promise.all([
      api.get("/api/user/"),
      getProducts(),
    ])
      .then(([userResponse, productsResponse]) => {
        const user = userResponse.data as AdminUser;
        if (!user.is_superuser) {
          router.push("/loja");
          return;
        }

        setIsAdmin(true);
        setProducts(productsResponse);
      })
      .catch((error) => {
        console.error("Erro ao carregar painel:", error);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.push("/");
  };

  const handleChange = (field: keyof ProductPayload, value: string | number | boolean | File | null) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
      };

      if (editingProductId) {
        const updated = await updateProduct(editingProductId, payload);
        setProducts((current) => current.map((product) => (
          product.id === editingProductId ? updated : product
        )));
        alert("Anúncio atualizado com sucesso!");
      } else {
        const created = await createProduct(payload);
        setProducts((current) => [created, ...current]);
        alert("Anúncio criado com sucesso!");
      }

      setFormData(emptyForm);
      setEditingProductId(null);
    } catch (error: any) {
      console.error("Erro ao criar anúncio:", error);
      const apiError = error?.response?.data;
      if (apiError?.detail) {
        alert(apiError.detail);
      } else if (apiError?.image) {
        alert(Array.isArray(apiError.image) ? apiError.image[0] : apiError.image);
      } else if (apiError?.name) {
        alert(Array.isArray(apiError.name) ? apiError.name[0] : apiError.name);
      } else if (apiError?.description) {
        alert(Array.isArray(apiError.description) ? apiError.description[0] : apiError.description);
      } else if (apiError?.price) {
        alert(Array.isArray(apiError.price) ? apiError.price[0] : apiError.price);
      } else {
        alert("Não foi possível criar o anúncio.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
      setImagePreview("");
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image: null,
      active: product.active,
    });
    setImagePreview(product.image_url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (productId: number) => {
    try {
      setDeletingProductId(productId);
      await deleteProduct(productId);
      setProducts((current) => current.filter((product) => product.id !== productId));
      setPendingDeleteId(null);
      if (editingProductId === productId) {
        setEditingProductId(null);
        setFormData(emptyForm);
        setImagePreview("");
      }
      alert("Anúncio excluído com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir anúncio:", error);
      const apiError = error?.response?.data;
      alert(getErrorMessage(apiError));
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setFormData(emptyForm);
    setImagePreview("");
  };

  const handleRequestDelete = (productId: number) => {
    setPendingDeleteId((current) => current === productId ? null : productId);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-slate-100">Carregando...</div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <div className="site-shell">
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
            <Link href="/painel-anuncios" className="site-nav-link transition-colors">
              Anúncios
            </Link>
            <div className="relative">
              <button
                type="button"
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
                    <Link href="/meus-dados" className="site-dropdown-link block w-full px-4 py-2 text-left text-sm">
                      Meus dados
                    </Link>
                    <Link href="/painel-anuncios" className="site-dropdown-link block w-full px-4 py-2 text-left text-sm">
                      Gerenciar anúncios
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="site-dropdown-link block w-full px-4 py-2 text-left text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
          <section className="site-panel self-start rounded-[2rem] p-6">
            <h1 className="text-3xl font-bold text-slate-50">{editingProductId ? "Editar anúncio" : "Novo anúncio"}</h1>
            <p className="mt-2 text-slate-300">Cadastre produtos da loja com imagem, descrição e preço.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200">Título</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  className="site-input mt-1 w-full rounded-xl px-3 py-2.5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(event) => handleChange("category", event.target.value as ProductPayload["category"])}
                  className="site-input mt-1 w-full rounded-xl px-3 py-2.5"
                >
                  <option value="vip">VIP</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200">Preço</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(event) => handleChange("price", Number(event.target.value))}
                  className="site-input mt-1 w-full rounded-xl px-3 py-2.5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200">Imagem</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    handleChange("image", file);
                    setImagePreview(file ? URL.createObjectURL(file) : "");
                  }}
                  className="site-file-input mt-1 w-full rounded-xl px-3 py-2.5"
                  required={!editingProductId}
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Pré-visualização"
                    className="mt-3 h-40 w-full rounded-lg object-cover"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(event) => handleChange("description", event.target.value)}
                  className="site-textarea mt-1 min-h-32 w-full rounded-xl px-3 py-2.5"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="site-accent-button w-full rounded-xl px-4 py-3 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Salvando..." : editingProductId ? "Salvar alterações" : "Publicar anúncio"}
              </button>
              {editingProductId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full rounded-xl border border-white/12 px-4 py-3 text-slate-200 transition-colors hover:bg-white/6"
                >
                  Cancelar edição
                </button>
              )}
            </form>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-50">Anúncios publicados</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <article key={product.id} className="site-panel overflow-hidden rounded-3xl">
                  <img src={product.image_url || "https://placehold.co/800x500?text=Rede+Numenor"} alt={product.name} className="h-48 w-full object-cover" />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-slate-50">{product.name}</h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate-300">
                      {getDescriptionSegments(product.description).slice(0, 3).map((segment, index) => (
                        <li key={`${product.id}-panel-${index}`} className="line-clamp-1">
                          - {segment}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-bold text-sky-300">{formatCurrency(product.price)}</span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
                          {(product.category_display ?? product.category).toUpperCase()}
                        </span>
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">Ativo</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="flex-1 rounded-xl border border-sky-400/20 bg-sky-400/8 px-4 py-2 text-sky-200 transition-colors hover:bg-sky-400/16"
                      >
                        Editar
                      </button>
                      {pendingDeleteId === product.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingProductId === product.id}
                            className="site-danger-button flex-1 rounded-xl px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingProductId === product.id ? "Excluindo..." : "Confirmar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(null)}
                            disabled={deletingProductId === product.id}
                            className="flex-1 rounded-xl border border-white/12 px-4 py-2 text-slate-200 transition-colors hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRequestDelete(product.id)}
                          disabled={deletingProductId === product.id}
                          className="site-danger-button flex-1 rounded-xl px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

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
