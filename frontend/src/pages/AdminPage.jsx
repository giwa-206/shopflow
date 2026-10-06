import { useEffect, useState } from "react";
import productService from "../services/productService";
import orderService from "../services/orderService";
import { Trash2 } from "lucide-react";

export default function AdminPage() {
  const [tab, setTab] = useState("orders");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", category_id: "", image_url: "" });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setProducts(await productService.getProducts());
    setCategories(await productService.getCategories());
    setOrders(await orderService.getAllOrders());
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    await productService.createProduct({
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      category_id: parseInt(form.category_id)
    });
    setForm({ name: "", description: "", price: "", stock: "", category_id: "", image_url: "" });
    refreshData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await productService.deleteProduct(id);
    refreshData();
  };

  const handleStatusChange = async (id, status) => {
    await orderService.updateStatus(id, status);
    refreshData();
  };

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>

      <div className="tabs">
        <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>Manage Orders</button>
        <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>Manage Products</button>
      </div>

      {tab === "orders" && (
        <div className="admin-section">
          <h2>All Customer Orders</h2>
          {orders.length === 0 && <p>No orders yet.</p>}
          {orders.map(o => (
            <div className="order-card" key={o.id}>
              <div className="order-header">
                <span className="order-id">Order #{o.id} (User #{o.user_id})</span>
                <select className="status-select" value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}>
                  {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="order-footer"><strong>${Number(o.subtotal).toFixed(2)}</strong></div>
            </div>
          ))}
        </div>
      )}

      {tab === "products" && (
        <div className="admin-section">
          <h2>Add New Product</h2>
          <form className="admin-form" onSubmit={handleCreateProduct}>
            <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input placeholder="Price" type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
            <input placeholder="Stock" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
            <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} required>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="Image URL" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />
            <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <button className="btn btn-primary" type="submit">Add Product</button>
          </form>

          <h2>Current Products</h2>
          {products.map(p => (
            <div className="cart-item" key={p.id}>
              <div className="cart-item-info">
                <strong>{p.name}</strong>
                <span className="muted">${Number(p.price).toFixed(2)} - Stock: {p.stock}</span>
              </div>
              <button className="icon-btn" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}