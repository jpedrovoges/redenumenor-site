import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}/api`;

function getAuthHeaders() {
  const token = localStorage.getItem("access");

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function addToCart(productId) {
  await axios.post(
    `${API_BASE_URL}/cart/add/`,
    { product_id: productId },
    {
      headers: getAuthHeaders(),
    }
  );
}

export async function getCart() {
  const response = await axios.get(`${API_BASE_URL}/cart/`, {
    headers: getAuthHeaders(),
  });

  return response.data;
}

export async function removeFromCart(productId) {
  await axios.post(
    `${API_BASE_URL}/cart/remove/`,
    { product_id: productId },
    {
      headers: getAuthHeaders(),
    }
  );
}

export async function checkout() {
  await axios.post(
    `${API_BASE_URL}/cart/checkout/`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
}
