import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import orderService from "../services/orderService";

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart, refreshCart } = useCart();
  const navigate = useNavigate();

  if (!cart) {
    return <div className="page-loading">Loading cart...</div>;
  }

  const handleCheckout = async () => {
    try {
      const order = await orderService.checkout();
      await refreshCart();
      alert(`Order #${order.id} placed successfully! Total: $${Number(order.subtotal).toFixed(2)}`);
    } catch (err) {
      alert(err.response?.data?.detail || "Checkout failed");
      await refreshCart();
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="placeholder">
        <ShoppingBag size={48} />
        <h2>Your cart is empty</h2>
        <button className="btn btn-primary" onClick={() => navigate("/")}>Browse products</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      <div className="cart-items">
        {cart.items.map((item) => (
          <div className="cart-item" key={item.id}>
            {item.product_image_url && <img src={item.product_image_url} alt={item.product_name} />}
            <div className="cart-item-info">
              <strong>{item.product_name}</strong>
              <span className="muted">${Number(item.unit_price).toFixed(2)} each</span>
            </div>
            <div className="qty-controls">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                <Minus size={14} />
              </button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                <Plus size={14} />
              </button>
            </div>
            <div className="cart-item-total">${Number(item.line_total).toFixed(2)}</div>
            <button className="icon-btn" onClick={() => removeItem(item.id)} title="Remove">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div><span className="muted">Total items:</span> <strong>{cart.total_quantity}</strong></div>
        <div className="cart-subtotal"><span>Subtotal:</span> <strong>${Number(cart.subtotal).toFixed(2)}</strong></div>
        <div className="cart-actions">
          <button className="btn btn-secondary" onClick={clearCart}>Clear cart</button>
          <button className="btn btn-primary" onClick={handleCheckout}>Checkout</button>
        </div>
      </div>
    </div>
  );
}