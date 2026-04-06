import api from "@/services/api";

const API_BASE_URL = "/api";

export type ProductPayload = {
  name: string;
  category: "vip" | "cash";
  price: number;
  description: string;
  image?: File | null;
  active?: boolean;
};

function buildProductFormData(product: ProductPayload) {
  const formData = new FormData();

  formData.append("name", product.name);
  formData.append("category", product.category);
  formData.append("price", String(product.price));
  formData.append("description", product.description);
  formData.append("active", String(product.active ?? true));

  if (product.image) {
    formData.append("image", product.image);
  }

  return formData;
}

export async function getProducts() {
  const response = await api.get(`${API_BASE_URL}/products/`);

  return response.data;
}

export async function createProduct(product: ProductPayload) {
  const response = await api.post(`${API_BASE_URL}/products/`, buildProductFormData(product));

  return response.data;
}

export async function updateProduct(productId: number, product: ProductPayload) {
  const response = await api.put(`${API_BASE_URL}/products/${productId}/`, buildProductFormData(product));

  return response.data;
}

export async function deleteProduct(productId: number) {
  const response = await api.delete(`${API_BASE_URL}/products/${productId}/`);

  return response.data;
}
