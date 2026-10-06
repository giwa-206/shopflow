import api from "./api";

const orderService = {
  async checkout() {
    const response = await api.post("/orders/");
    return response.data;
  },
  async getMyOrders() {
    const response = await api.get("/orders/");
    return response.data;
  },
  async getAllOrders() {
    const response = await api.get("/admin/orders");
    return response.data;
  },
  async updateStatus(id, status) {
    const response = await api.patch(`/admin/orders/${id}/status`, { status });
    return response.data;
  },
};

export default orderService;