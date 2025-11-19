import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../../services/api';
import { Order } from '../../types';

const CheckoutPage: React.FC = () => {
  const { cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.address) {
      setShippingAddress(user.address);
    }
  }, [user]);

  const total = cart.reduce((acc, item) => acc + parseFloat(item.Product.price) * item.quantity, 0);
  
  const commonInputClass = "w-full bg-secondary border-border-color rounded-md shadow-sm focus:ring-accent focus:border-accent text-text-primary";

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
        setError('Shipping address is required.');
        return;
    }
    setError('');
    setIsLoading(true);

    try {
      // Step 1: Create the order
      // Lưu ý: Đặt tên biến là responseData cho đỡ nhầm lẫn
      const responseData: any = await api.post('/order', {
        shipping_address: shippingAddress,
        notes: notes,
      });

      // LOG RA ĐỂ CHECK CHO CHẮC
      console.log("Response từ Server:", responseData);

      // SỬA Ở ĐÂY: Truy cập vào .order để lấy id
      const createdOrder = responseData.order; 

      if (!createdOrder || !createdOrder.id) {
          throw new Error('Failed to create order. No ID returned.');
      }

      // Step 2: Request payment URL
      // SỬA Ở ĐÂY: Lấy amount từ createdOrder.total_amount
      const amountToSend = Math.round(parseFloat(createdOrder.total_amount));

      const paymentData = {
          orderId: createdOrder.id, // Lấy ID đúng chỗ
          amount: amountToSend
      };

      console.log("Gửi đi thanh toán:", paymentData); // Log ra xem đúng chưa

      const paymentResponse = await api.post<{ paymentUrl: string }>('/payment/create', paymentData);

      // Step 3: Redirect
      if (paymentResponse.paymentUrl) {
          window.location.href = paymentResponse.paymentUrl;
      } else {
          // Một số trường hợp response lồng nhau tương tự, bạn check log paymentResponse nhé
          // Ví dụ nếu nó là paymentResponse.data.paymentUrl
          console.log("Payment Response Raw:", paymentResponse);
          throw new Error('Could not retrieve payment URL.');
      }

    } catch (err: any) {
      console.error("Lỗi Checkout:", err);
      setError(err.message || 'Failed to place order.');
      setIsLoading(false);
    }
  };

  if (cart.length === 0 && !isLoading) {
    return <Navigate to="/products" replace />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6 text-center">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-primary p-8 rounded-lg shadow-sm border border-border-color">
          <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>
          <form onSubmit={handlePlaceOrder}>
            <div className="space-y-6">
              <div>
                <label htmlFor="shipping_address" className="block text-sm font-medium text-text-secondary mb-1">Shipping Address</label>
                <textarea
                  id="shipping_address"
                  rows={4}
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  className={commonInputClass}
                  required
                ></textarea>
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-1">Order Notes (Optional)</label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className={commonInputClass}
                  placeholder="Special instructions for delivery..."
                ></textarea>
              </div>
              {error && <p className="text-sm text-red-700 bg-red-100 p-3 rounded-md">{error}</p>}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-accent text-white font-semibold px-6 py-3 rounded-md hover:bg-highlight transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </form>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-primary p-6 rounded-lg shadow-sm sticky top-24 border border-border-color">
             <h2 className="text-xl font-semibold border-b border-border-color pb-4 mb-4">Your Order</h2>
             <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {cart.map(item => (
                    <div key={item.product_id} className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold">{item.Product.name}</p>
                            <p className="text-sm text-text-secondary">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium">{(item.quantity * parseFloat(item.Product.price)).toLocaleString('vi-VN')} ₫</p>
                    </div>
                ))}
             </div>
             <div className="flex justify-between font-bold text-xl border-t border-border-color pt-4 mt-4">
                <span>Total</span>
                <span>{total.toLocaleString('vi-VN')} ₫</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
