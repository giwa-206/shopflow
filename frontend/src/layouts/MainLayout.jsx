import { Link, Outlet, useNavigate } from "react-router-dom";
import { LogOut, ShoppingCart, Store } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="layout">
      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand">
            <Store size={22} /> ShopFlow
          </Link>

          <nav className="nav-links">
            <Link to="/">Products</Link>
            {user && <Link to="/orders">My Orders</Link>}
            {user?.role === "admin" && <Link to="/admin">Admin</Link>}
          </nav>

          <div className="nav-actions">
            <Link to="/cart" className="cart-link" title="Cart">
              <ShoppingCart size={20} />
              {cart && cart.total_quantity > 0 && (
                <span className="cart-badge">{cart.total_quantity}</span>
              )}
            </Link>

            {user ? (
              <div className="user-area">
                <span className="user-email">{user.email}</span>
                <button className="btn btn-secondary" onClick={handleLogout}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <div className="user-area">
                <Link to="/login" className="btn btn-secondary">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>ShopFlow — Full-Stack E-Commerce (FastAPI + React)</p>
      </footer>
    </div>
  );
}