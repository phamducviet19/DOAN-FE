import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, ShoppingCart, RefreshCcw, HelpCircle } from 'lucide-react';

const PaymentFailedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-primary border border-border-color p-8 md:p-12 rounded-lg shadow-lg max-w-2xl mx-auto text-center">
        
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <XCircle className="text-red-600 w-16 h-16" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-4">Payment Failed</h1>
        <p className="text-text-secondary mb-6 text-lg">
          We were unable to process your payment for order <span className="font-bold text-text-primary">#{orderIdParam}</span>.
        </p>
        
        <div className="bg-red-50 border border-red-100 rounded-md p-4 mb-8 max-w-md mx-auto">
            <p className="text-sm text-red-800">
                Don't worry, no funds have been deducted from your account. This could be due to a network issue, insufficient funds, or a cancelled transaction.
            </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/checkout" 
            className="flex items-center justify-center bg-accent text-white font-semibold px-6 py-3 rounded-md hover:bg-highlight transition-colors shadow-md"
          >
            <RefreshCcw size={18} className="mr-2"/> Try Again
          </Link>
          <Link 
            to="/cart" 
            className="flex items-center justify-center bg-primary border border-border-color text-text-primary font-semibold px-6 py-3 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ShoppingCart size={18} className="mr-2"/> Return to Cart
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border-color">
             <p className="text-sm text-text-secondary flex items-center justify-center gap-2">
                <HelpCircle size={16}/>
                Need help? <a href="mailto:support@pcparts.com" className="text-accent hover:underline">Contact Support</a>
             </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;