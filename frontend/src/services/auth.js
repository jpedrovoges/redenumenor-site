import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function login(username, password) {
  const response = await axios.post(
    `${API_BASE_URL}/api/login/`,
    { username, password }
  );

  const { access, refresh } = response.data;

  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);

  return response.data;
}

export async function register(firstName, username, email, password) {
  const response = await axios.post(
    `${API_BASE_URL}/api/register/`,
    { first_name: firstName, username, email, password }
  );
  const { access, refresh } = response.data;

  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);

  return response.data;
}

export async function refreshToken() {
  const refresh = localStorage.getItem("refresh");

  const response = await axios.post(
    `${API_BASE_URL}/api/token/refresh/`,
    { refresh }
  );

  localStorage.setItem("access", response.data.access);
}