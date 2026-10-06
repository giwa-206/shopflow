import api from "./api";

const productService = {
  async getProducts(params = {}) {
    const response = await api.get("/products/", { params });
    return response.data;
  },
  async getCategories() {
    const response = await api.get("/categories/");
    return response.data;
  },
  async createProduct(data) {
    const response = await api.post("/products/", data);
    return response.data;
  },
  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  async createCategory(data) {
    const response = await api.post("/categories/", data);
    return response.data;
  },
};

export default productService;