import { useEffect, useState } from "react";
import productService from "../services/productService";
import ProductCard from "../components/ProductCard";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category_id: "",
    sort_by: "created_at",
    sort_order: "desc",
  });

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { ...filters };
    Object.keys(params).forEach((k) => params[k] === "" && delete params[k]);
    productService
      .getProducts(params)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div>
      <div className="home-header">
        <h1>Our Products</h1>
        <div className="filters">
          <input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select value={filters.category_id} onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={filters.sort_by} onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}>
            <option value="created_at">Newest</option>
            <option value="price">Price</option>
            <option value="name">Name</option>
          </select>
          <select value={filters.sort_order} onChange={(e) => setFilters({ ...filters, sort_order: e.target.value })}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="placeholder">
          <h2>No products found</h2>
          <p>Try changing your search or filters.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}