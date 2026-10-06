import { useEffect, useState } from "react";
import orderService from "../services/orderService";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="placeholder">
        <h2>No orders yet</h2>
        <p>Go buy something!</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      {orders.map((order) => (
        <div className="order-card" key={order.id}>
          <div className="order-header">
            <span className="order-id">Order #{order.id}</span>
            <span className={`status status-${order.status}`}>{order.status}</span>
            <span className="muted">{new Date(order.created_at).toLocaleDateString()}</span>
          </div>
          <div className="order-items">
            {order.items.map((item) => (
              <div className="order-item" key={item.id}>
                <span>{item.product_name} × {item.quantity}</span>
                <span>${Number(item.line_total).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="order-footer">
            <strong>Total: ${Number(order.subtotal).toFixed(2)}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}