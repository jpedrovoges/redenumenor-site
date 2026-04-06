import api from "@/services/api";

const API_BASE_URL = "/api";

export async function addToCart(productId: number) {
  await api.post(
    `${API_BASE_URL}/cart/add/`,
    { product_id: productId }
  );
}

export async function getCart() {
  const response = await api.get(`${API_BASE_URL}/cart/`);

  return response.data;
}

export async function removeFromCart(productId: number) {
  await api.post(
    `${API_BASE_URL}/cart/remove/`,
    { product_id: productId }
  );
}

export async function checkout() {
  await api.post(`${API_BASE_URL}/cart/checkout/`, {});
}
