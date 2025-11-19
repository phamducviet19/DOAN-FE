import React from 'react';
import { useWishlist } from '../../contexts/WishlistContext';
import { Link } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import { Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { API_HOST } from '../../services/api';

const WishlistPage: React.FC = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  if (wishlist.length === 0) {
    return (
      <div className="text-center bg-primary border border-border-color p-10 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-text-primary mb-4">Your Wishlist is Empty</h1>
        <p className="text-text-secondary mb-6">Add your favorite items to your wishlist to keep track of them.</p>
        <Link to="/products" className="bg-accent text-white font-semibold px-6 py-3 rounded-md hover:bg-highlight transition-colors">
          Discover Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-primary p-6 rounded-lg shadow-sm border border-border-color">
      <h1 className="text-3xl font-bold text-text-primary mb-6">My Wishlist</h1>
      <div className="space-y-4">
        {wishlist.map(item => (
          <div key={item.product_id} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-border-color rounded-md bg-secondary">
            <div className="flex items-center mb-4 sm:mb-0 flex-grow">
              <img src={item.Product.mainImage ? `${API_HOST}${item.Product.mainImage}` : `https://via.placeholder.com/80x80.png/F9FAFB/6B7280?text=No+Image`} alt={item.Product.name} className="w-20 h-20 object-contain rounded-md mr-4 border border-border-color" />
              <div className="flex-grow">
                <Link to={`/product/${item.Product.id}`} className="font-semibold text-text-primary hover:text-highlight">{item.Product.name}</Link>
                <p className="text-lg text-accent font-bold mt-1">{parseFloat(item.Product.price).toLocaleString('vi-VN')} ₫</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
               <button 
                  onClick={() => addToCart(item.product_id, 1)} 
                  disabled={item.Product.stock === 0}
                  className="px-4 py-2 text-sm bg-accent text-white rounded-md hover:bg-highlight disabled:bg-gray-400 flex items-center"
                >
                  <ShoppingCart size={16} className="mr-2"/>
                  Add to Cart
              </button>
              <button onClick={() => removeFromWishlist(item.product_id)} className="p-2 text-red-500 hover:bg-gray-100 rounded-full">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;