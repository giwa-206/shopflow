import api from "./api";

const authService = {
  // The backend login endpoint expects FORM data (OAuth2 standard), not JSON
  async login(email, password) {
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);
    const response = await api.post("/auth/login", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data; // { access_token, token_type }
  },

  async register(data) {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  async getMe() {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

export default authService;