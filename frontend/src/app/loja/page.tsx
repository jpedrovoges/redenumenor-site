"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { addToCart, getCart, removeFromCart, checkout } from "@/services/cart";
import { formatCurrency } from "@/lib/currency";
import { getDescriptionSegments } from "@/lib/product-description";

type Product = {
  id: number;
  name: string;
  category: "vip" | "cash";
  category_display?: string;
  description: string;
  price: number;
  image_url: string;
};

type CartItem = {
  id: number;
  product: number;
  product_name: string;
  product_price: number;
  quantity: number;
};

type Cart = {
  id?: number;
  items: CartItem[];
};

export default function Loja() {
  const [selectedCategory, setSelectedCategory] = useState<"vip" | "cash">("vip");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/login"); // Redirect to login if not authenticated
    } else {
      setIsLoggedIn(true);
      Promise.all([
        api.get("/api/user/"),
        api.get("/api/products/"),
        getCart(),
      ])
        .then(([userResponse, productsResponse, cartResponse]) => {
          setIsAdmin(Boolean(userResponse.data.is_superuser));
          setProducts(productsResponse.data);
          setCart(cartResponse);
        })
        .catch((err) => {
          console.error("Erro ao carregar loja:", err);
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
    router.push("/"); // Redirect to home after logout
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const refreshCart = async () => {
    const cartResponse = await getCart();
    setCart(cartResponse);
  };

  const handleAddToCart = async (productId: number) => {
    setCartLoading(true);
    try {
      await addToCart(productId);
      await refreshCart();
    } catch (err) {
      console.error("Erro ao adicionar ao carrinho:", err);
      alert("Erro ao adicionar produto ao carrinho.");
    } finally {
      setCartLoading(false);
    }
  };

  const handleRemoveFromCart = async (productId: number) => {
    setCartLoading(true);
    try {
      await removeFromCart(productId);
      await refreshCart();
    } catch (err) {
      console.error("Erro ao remover do carrinho:", err);
      alert("Erro ao remover produto do carrinho.");
    } finally {
      setCartLoading(false);
    }
  };

  const handleCheckout = async () => {
    setCartLoading(true);
    try {
      await checkout();
      await refreshCart();
      alert("Pedido realizado com sucesso!");
    } catch (err) {
      console.error("Erro ao finalizar pedido:", err);
      alert("Erro ao finalizar pedido.");
    } finally {
      setCartLoading(false);
    }
  };

  if (!isLoggedIn || loading) {
    return null; // Prevent rendering if not logged in
  }

  const cartTotal = cart.items.reduce((total, item) => total + (item.product_price * item.quantity), 0);
  const vipProducts = products.filter((product) => product.category === "vip");
  const cashProducts = products.filter((product) => product.category === "cash");
  const filteredProducts = selectedCategory === "vip" ? vipProducts : cashProducts;

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
        <div className="flex flex-col gap-10 lg:flex-row">
          <section className="flex-1">
            <h2 className="mb-8 text-3xl font-bold text-slate-50">Bem-vindo à Loja</h2>
            <div className="mb-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setSelectedCategory("vip")}
                className={selectedCategory === "vip"
                  ? "site-accent-button rounded-xl px-4 py-2"
                  : "rounded-xl border border-white/12 px-4 py-2 text-slate-200 transition-colors hover:bg-white/6"}
              >
                VIP ({vipProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("cash")}
                className={selectedCategory === "cash"
                  ? "site-accent-button rounded-xl px-4 py-2"
                  : "rounded-xl border border-white/12 px-4 py-2 text-slate-200 transition-colors hover:bg-white/6"}
              >
                Cash ({cashProducts.length})
              </button>
            </div>
            {filteredProducts.length === 0 ? (
              <p className="text-lg text-slate-300">Nenhum produto disponível no momento.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  (() => {
                    const descriptionSegments = getDescriptionSegments(product.description);
                    const previewSegments = descriptionSegments.slice(0, 3);

                    return (
                  <article key={product.id} className="site-panel overflow-hidden rounded-3xl">
                    <img
                      src={product.image_url || "https://placehold.co/800x500?text=Rede+Numenor"}
                      alt={product.name}
                      className="h-48 w-full object-cover"
                    />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold text-slate-50">{product.name}</h3>
                        <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
                          {(product.category_display ?? product.category).toUpperCase()}
                        </span>
                      </div>
                      <ul className="mt-2 space-y-1 text-sm text-slate-300">
                        {previewSegments.map((segment, index) => (
                          <li key={`${product.id}-segment-${index}`} className="line-clamp-1">
                            - {segment}
                          </li>
                        ))}
                        {descriptionSegments.length > previewSegments.length && (
                          <li className="text-slate-500">...</li>
                        )}
                      </ul>
                      <div className="mt-4">
                        <span className="text-xl font-bold text-sky-300">{formatCurrency(product.price)}</span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(product)}
                          className="flex-1 rounded-xl border border-sky-400/20 bg-sky-400/8 px-4 py-2 text-sky-200 transition-colors hover:bg-sky-400/16"
                        >
                          Ver mais
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product.id)}
                          disabled={cartLoading}
                          className="site-accent-button flex-1 rounded-xl px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Carrinho
                        </button>
                      </div>
                    </div>
                  </article>
                    );
                  })()
                ))}
              </div>
            )}
          </section>

          <aside className="site-panel w-full self-start rounded-3xl p-6 lg:sticky lg:top-28 lg:w-[360px]">
            <h3 className="text-2xl font-semibold text-slate-50">Carrinho</h3>
            {cart.items.length === 0 ? (
              <p className="mt-4 text-slate-300">Seu carrinho está vazio.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/8 bg-slate-950/30 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-100">{item.product_name}</p>
                        <p className="text-sm text-slate-400">Quantidade: {item.quantity}</p>
                        <p className="text-sm font-semibold text-sky-300">{formatCurrency(item.product_price)}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.product)}
                        disabled={cartLoading}
                        className="text-sm font-medium text-red-400 hover:text-red-300 disabled:opacity-60"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between text-lg font-semibold text-slate-50">
                    <span>Total</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={cartLoading}
                    className="site-success-button mt-4 w-full rounded-xl px-4 py-3 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Finalizar compra
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>

        {selectedProduct && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/60 px-4">
            <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(9,16,28,0.98)] shadow-2xl lg:flex-row">
              <div className="lg:w-[46%] lg:flex-shrink-0">
                <img
                  src={selectedProduct.image_url || "https://placehold.co/1200x700?text=Rede+Numenor"}
                  alt={selectedProduct.name}
                  className="h-72 w-full object-cover lg:h-full"
                />
              </div>
              <div className="flex min-h-0 flex-1 flex-col p-6">
                {(() => {
                  const descriptionSegments = getDescriptionSegments(selectedProduct.description);

                  return (
                    <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-50">{selectedProduct.name}</h3>
                    <p className="mt-2 text-lg font-semibold text-sky-300">{formatCurrency(selectedProduct.price)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/6 hover:text-slate-100"
                  >
                    Fechar
                  </button>
                </div>
                <div className="mt-5 min-h-0 flex-1 overflow-hidden">
                  <ul className="max-h-full space-y-2 overflow-y-auto pr-2 text-slate-300">
                    {descriptionSegments.map((segment, index) => (
                      <li key={`${selectedProduct.id}-detail-${index}`}>- {segment}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct.id);
                      setSelectedProduct(null);
                    }}
                    disabled={cartLoading}
                    className="site-accent-button rounded-xl px-5 py-3 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Carrinho
                  </button>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="rounded-xl border border-white/12 px-5 py-3 text-slate-200 transition-colors hover:bg-white/6"
                  >
                    Voltar
                  </button>
                </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
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