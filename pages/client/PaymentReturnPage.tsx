
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Loader, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';
import { Order } from '../../types';

const PaymentReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { fetchCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  // Status represents the visual state of the page
  const [status, setStatus] = useState<'success' | 'failed' | 'pending' | 'error'>('pending');

  const orderIdParam = searchParams.get('orderId');
  const vnpResponseCode = searchParams.get('vnp_ResponseCode');

  useEffect(() => {
    const verifyOrder = async () => {
      // 1. Check for explicit failure code from URL (if present)
      if (vnpResponseCode && vnpResponseCode !== '00') {
        setStatus('failed');
        setLoading(false);
        return;
      }

      // 2. If no orderId, we can't verify anything
      if (!orderIdParam) {
        setStatus('error');
        setLoading(false);
        return;
      }

      try {
        // 3. Fetch user's orders to find the specific one and check its status.
        // We use the list endpoint since we know we have access to it.
        const response = await api.get<{ data: Order[] }>('/order');
        const orders = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
        const foundOrder = orders.find(o => o.id === Number(orderIdParam));

        if (foundOrder) {
          setOrder(foundOrder);
          
          // 4. Determine UI status based on Order Status from DB
          if (foundOrder.status === 'Confirmed' || foundOrder.status === 'Shipped') {
             setStatus('success');
             fetchCart(); // Ensure cart is cleared in UI
          } else if (foundOrder.status === 'Cancelled') {
             setStatus('failed');
          } else {
             // Status is 'Pending'. 
             // If we have a success code '00' in URL but DB is still pending, optimistically show success
             // otherwise show pending/processing state.
             if (vnpResponseCode === '00') {
                setStatus('success');
                fetchCart();
             } else {
                setStatus('pending');
             }
          }
        } else {
          setStatus('error'); // Order ID not found in user's history
        }
      } catch (error) {
        console.error("Error verifying order:", error);
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    verifyOrder();
  }, [orderIdParam, vnpResponseCode, fetchCart]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-16 h-16 text-accent animate-spin mb-6" />
          <h2 className="text-xl font-semibold text-text-primary">Verifying Payment...</h2>
          <p className="text-text-secondary mt-2">Please wait while we confirm your order details.</p>
        </div>
      );
    }

    switch (status) {
      case 'success':
        return (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="text-green-600 w-16 h-16" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-4">Payment Successful!</h1>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              Thank you for your purchase. Your order <span className="font-bold text-text-primary">#{orderIdParam}</span> has been received and is being processed.
            </p>
            
            {order && (
                <div className="bg-secondary p-6 rounded-lg mb-8 text-left inline-block w-full max-w-md border border-border-color shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                        <span className="text-text-secondary">Order Total</span>
                        <span className="text-xl font-bold text-accent">{parseFloat(order.total_amount).toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Shipping Address</p>
                            <p className="text-text-primary mt-1">{order.shipping_address}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</p>
                            <p className="text-text-primary mt-1">{new Date(order.order_date).toLocaleDateString()} {new Date(order.order_date).toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/profile" className="flex items-center justify-center bg-accent text-white font-semibold px-6 py-3 rounded-md hover:bg-highlight transition-colors">
                View Order Details <ArrowRight size={18} className="ml-2"/>
              </Link>
              <Link to="/products" className="flex items-center justify-center bg-primary border border-border-color text-text-primary font-semibold px-6 py-3 rounded-md hover:bg-gray-50 transition-colors">
                <ShoppingBag size={18} className="mr-2"/> Continue Shopping
              </Link>
            </div>
          </>
        );

      case 'failed':
        return (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <XCircle className="text-red-600 w-16 h-16" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-4">Payment Failed</h1>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              We were unable to process your payment. No funds have been deducted. You can try paying again or choose a different payment method.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Link to="/cart" className="bg-accent text-white font-semibold px-6 py-3 rounded-md hover:bg-highlight transition-colors">
                Return to Cart
              </Link>
              <Link to="/checkout" className="bg-primary border border-border-color text-text-primary font-semibold px-6 py-3 rounded-md hover:bg-gray-50 transition-colors">
                Try Again
              </Link>
            </div>
          </>
        );

      case 'pending':
        return (
          <>
             <div className="flex justify-center mb-6">
              <div className="bg-yellow-100 p-4 rounded-full">
                <AlertCircle className="text-yellow-600 w-16 h-16" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-4">Payment Processing</h1>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Your order <span className="font-bold">#{orderIdParam}</span> has been created, but we are still waiting for the final payment confirmation from the gateway.
            </p>
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100 max-w-md mx-auto mb-8">
                <p className="text-sm text-yellow-800">
                    Please check your email or order history in a few minutes. If you have already paid, the status will update automatically.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/profile" className="bg-accent text-white font-semibold px-6 py-3 rounded-md hover:bg-highlight transition-colors">
                Check Status in Profile
              </Link>
              <Link to="/" className="bg-primary border border-border-color text-text-primary font-semibold px-6 py-3 rounded-md hover:bg-gray-50 transition-colors">
                Back to Home
              </Link>
            </div>
          </>
        );

      default: // error
        return (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 p-4 rounded-full">
                <AlertCircle className="text-gray-500 w-16 h-16" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-4">Unable to Verify</h1>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              We couldn't retrieve the details for this transaction. This might happen if the link is invalid or the order doesn't exist.
            </p>
             <div className="flex justify-center gap-4">
              <Link to="/profile" className="bg-accent text-white font-semibold px-6 py-3 rounded-md hover:bg-highlight transition-colors">
                Go to My Orders
              </Link>
            </div>
          </>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
        <div className="bg-primary border border-border-color p-8 md:p-12 rounded-lg shadow-lg max-w-3xl mx-auto text-center">
            {renderContent()}
        </div>
    </div>
  );
};

export default PaymentReturnPage;
