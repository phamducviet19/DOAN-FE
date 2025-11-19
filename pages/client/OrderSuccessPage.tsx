import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderSuccessPage: React.FC = () => {
  return (
    <div className="text-center bg-primary border border-border-color p-10 rounded-lg shadow-sm max-w-2xl mx-auto">
      <div className="flex justify-center mb-4">
          <CheckCircle className="text-green-500" size={80} />
      </div>
      <h1 className="text-3xl font-bold text-text-primary mb-4">Thank You For Your Order!</h1>
      <p className="text-text-secondary mb-6">
        Your order has been placed successfully. You can view its status in your profile.
      </p>
      <div className="flex justify-center space-x-4">
        <Link to="/profile" className="bg-accent text-white font-semibold px-6 py-3 rounded-md hover:bg-highlight transition-colors">
          View My Orders
        </Link>
        <Link to="/products" className="bg-primary border border-border-color text-text-primary font-semibold px-6 py-3 rounded-md hover:bg-gray-100 transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;