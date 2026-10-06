import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const outOfStock = product.stock < 1;

  const handleAdd = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await addToCart(product.id, 1);
    } catch (err) {
      alert(err.response?.data?.detail || "Could not add to cart");
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <div className="product-image-placeholder">No image</div>
        )}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-price">${Number(product.price).toFixed(2)}</p>
        <p className={outOfStock ? "stock-out" : "stock-in"}>
          {outOfStock ? "Out of stock" : `${product.stock} in stock`}
        </p>
        <button className="btn btn-primary btn-block" onClick={handleAdd} disabled={outOfStock}>
          <ShoppingCart size={16} /> Add to cart
        </button>
      </div>
    </div>
  );
}