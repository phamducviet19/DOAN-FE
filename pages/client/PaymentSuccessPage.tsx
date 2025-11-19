import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader, ShoppingBag, ArrowRight, MapPin, Calendar, Package } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';
import { Order } from '../../types';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  
  const orderIdParam = searchParams.get('orderId');

  useEffect(() => {
    const initSuccessPage = async () => {
      if (!orderIdParam) {
        setLoading(false);
        return;
      }

      try {
        // 1. Clear the cart locally since payment was successful
        // We do this immediately to improve UX so they don't see items in cart anymore
        await clearCart();

        // 2. Fetch the order details to display the receipt
        const response = await api.get<{ data: Order[] }>('/order');
        const orders = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
        const foundOrder = orders.find(o => o.id === Number(orderIdParam));

        if (foundOrder) {
          setOrder(foundOrder);
        }
      } catch (error) {
        console.error("Error initializing success page:", error);
      } finally {
        setLoading(false);
      }
    };

    initSuccessPage();
  }, [orderIdParam, clearCart]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader className="w-16 h-16 text-green-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-text-primary">Finalizing your order...</h2>
      </div>
    );
  }

  if (!orderIdParam) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Invalid Request</h2>
        <Link to="/" className="text-accent hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-primary border border-border-color p-8 md:p-12 rounded-lg shadow-lg max-w-3xl mx-auto text-center">
        
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full animate-bounce">
            <CheckCircle className="text-green-600 w-16 h-16" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Payment Successful!</h1>
        <p className="text-text-secondary mb-8 text-lg">
          Thank you for your purchase. Your order <span className="font-bold text-text-primary">#{orderIdParam}</span> has been confirmed.
        </p>

        {order && (
          <div className="bg-secondary p-6 rounded-lg mb-10 text-left border border-border-color max-w-xl mx-auto">
            <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2">Order Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-text-secondary mr-2 mt-0.5" />
                  <div>
                     <p className="text-xs text-text-secondary uppercase font-semibold">Order Date</p>
                     <p className="text-sm text-text-primary">{new Date(order.order_date).toLocaleString()}</p>
                  </div>
               </div>
               <div className="flex items-start">
                  <Package className="w-5 h-5 text-text-secondary mr-2 mt-0.5" />
                  <div>
                     <p className="text-xs text-text-secondary uppercase font-semibold">Total Amount</p>
                     <p className="text-lg font-bold text-green-600">{parseFloat(order.total_amount).toLocaleString('vi-VN')} ₫</p>
                  </div>
               </div>
            </div>
            
            <div className="flex items-start mb-4">
                <MapPin className="w-5 h-5 text-text-secondary mr-2 mt-0.5" />
                <div>
                    <p className="text-xs text-text-secondary uppercase font-semibold">Shipping Address</p>
                    <p className="text-sm text-text-primary">{order.shipping_address}</p>
                </div>
            </div>

            {order.notes && (
                <div className="mt-4 p-3 bg-primary rounded border border-border-color text-sm text-text-secondary italic">
                    " {order.notes} "
                </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/profile" 
            className="flex items-center justify-center bg-accent text-white font-semibold px-8 py-3 rounded-md hover:bg-highlight transition-colors shadow-md"
          >
            Track My Order <ArrowRight size={18} className="ml-2"/>
          </Link>
          <Link 
            to="/products" 
            className="flex items-center justify-center bg-primary border border-border-color text-text-primary font-semibold px-8 py-3 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ShoppingBag size={18} className="mr-2"/> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;