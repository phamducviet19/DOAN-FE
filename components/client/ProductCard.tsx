import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, GitCompare } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCompare } from '../../contexts/CompareContext';
import { useAuth } from '../../contexts/AuthContext';
import { API_HOST } from '../../services/api';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare } = useCompare();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(product.id, 1);
  };
  
  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToWishlist(product.id);
  };

  const handleAddToCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCompare(product);
  };

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  
  const imageUrl = product.mainImage ? `${API_HOST}${product.mainImage}` : `https://via.placeholder.com/300x300.png/F9FAFB/6B7280?text=${encodeURIComponent(product.name)}`;

  return (
    <Link to={`/product/${product.id}`} className="group block bg-primary rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-border-color hover:border-highlight transform hover:-translate-y-1">
      <div className="relative pt-[100%] overflow-hidden bg-secondary">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="absolute top-0 left-0 w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4 flex flex-col h-48 justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary truncate" title={product.name}>{product.name}</h3>
          <p className="text-lg font-bold text-accent mt-2">{parseFloat(product.price).toLocaleString('vi-VN')} ₫</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 flex items-center justify-center bg-accent text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-highlight disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart size={16} className="mr-2" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <div className="flex ml-2">
            <button onClick={handleAddToWishlist} className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${inWishlist ? 'text-red-500' : 'text-text-secondary'}`} title="Add to Wishlist">
                <Heart size={18} />
            </button>
            <button onClick={handleAddToCompare} className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${inCompare ? 'text-blue-500' : 'text-text-secondary'}`} title="Add to Compare">
              <GitCompare size={18} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;