import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { Link } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import { Trash2 } from 'lucide-react';
import { API_HOST } from '../../services/api';

const CartPage: React.FC = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();

  const total = cart.reduce((acc, item) => acc + parseFloat(item.Product.price) * item.quantity, 0);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  if (cart.length === 0) {
    return (
      <div className="text-center bg-primary border border-border-color p-10 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-text-primary mb-4">Your Cart is Empty</h1>
        <p className="text-text-secondary mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="bg-accent text-white font-semibold px-6 py-3 rounded-md hover:bg-highlight transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-primary p-6 rounded-lg shadow-sm border border-border-color">
          <div className="flex justify-between items-center border-b border-border-color pb-4 mb-4">
             <h2 className="text-xl font-semibold">Products ({cart.length})</h2>
             <button onClick={clearCart} className="text-sm text-red-600 hover:underline">Clear Cart</button>
          </div>
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.product_id} className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-border-color">
                <div className="flex items-center mb-4 sm:mb-0 flex-grow">
                  <img src={item.Product.mainImage ? `${API_HOST}${item.Product.mainImage}` : `https://via.placeholder.com/80x80.png/F9FAFB/6B7280?text=No+Image`} alt={item.Product.name} className="w-20 h-20 object-contain rounded-md mr-4 border border-border-color" />
                  <div>
                    <Link to={`/product/${item.Product.id}`} className="font-semibold text-text-primary hover:text-highlight">{item.Product.name}</Link>
                    <p className="text-sm text-text-secondary">{parseFloat(item.Product.price).toLocaleString('vi-VN')} ₫</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-border-color rounded-md">
                      <button onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))} className="px-3 py-1 font-medium hover:bg-gray-100 transition-colors">-</button>
                      <span className="w-12 text-center py-1 bg-secondary border-x border-border-color">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, Math.min(item.Product.stock, item.quantity + 1))} className="px-3 py-1 font-medium hover:bg-gray-100 transition-colors">+</button>
                  </div>
                  <p className="font-semibold w-24 text-right">{(parseFloat(item.Product.price) * item.quantity).toLocaleString('vi-VN')} ₫</p>
                   <button onClick={() => removeFromCart(item.product_id)} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-primary p-6 rounded-lg shadow-sm sticky top-24 border border-border-color">
             <h2 className="text-xl font-semibold border-b border-border-color pb-4 mb-4">Order Summary</h2>
             <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-semibold">{total.toLocaleString('vi-VN')} ₫</span>
             </div>
             <div className="flex justify-between mb-4">
                <span className="text-text-secondary">Shipping</span>
                <span className="font-semibold text-green-600">Free</span>
             </div>
             <div className="flex justify-between font-bold text-xl border-t border-border-color pt-4">
                <span>Total</span>
                <span>{total.toLocaleString('vi-VN')} ₫</span>
             </div>
             <Link to="/checkout" className="block w-full text-center mt-6 bg-accent text-white font-semibold px-6 py-3 rounded-md hover:bg-highlight transition-colors">
                Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;