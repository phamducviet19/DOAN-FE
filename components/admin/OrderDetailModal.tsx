import React from 'react';
import { Order } from '../../types';
import { X } from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-gray-800 text-gray-200 rounded-lg shadow-xl w-full max-w-3xl p-8 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-100">Order Details - #{order.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>
        
        <div className="overflow-y-auto pr-4 -mr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Customer Info</h3>
              <p><span className="font-medium text-gray-400">Name:</span> {order.User.name}</p>
              <p><span className="font-medium text-gray-400">Email:</span> {order.User.email}</p>
              <p><span className="font-medium text-gray-400">Phone:</span> {order.User.phone}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Order Summary</h3>
              <p><span className="font-medium text-gray-400">Order Date:</span> {new Date(order.order_date).toLocaleString()}</p>
              <p><span className="font-medium text-gray-400">Status:</span> {order.status}</p>
              <p><span className="font-medium text-gray-400">Total:</span> {parseFloat(order.total_amount).toLocaleString('vi-VN')} ₫</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Shipping Address</h3>
            <p className="whitespace-pre-wrap">{order.shipping_address}</p>
          </div>
          
          {order.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Notes</h3>
              <p className="italic text-gray-400">{order.notes}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Products</h3>
            <div className="overflow-x-auto bg-gray-900/50 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Product</th>
                    <th scope="col" className="px-6 py-3 text-center">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-right">Unit Price</th>
                    <th scope="col" className="px-6 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.OrderDetails.map(detail => (
                    <tr key={detail.id} className="border-b border-gray-700/50">
                      <td className="px-6 py-4 font-medium text-gray-100">{detail.Product.name}</td>
                      <td className="px-6 py-4 text-center">{detail.quantity}</td>
                      <td className="px-6 py-4 text-right">{parseFloat(detail.price).toLocaleString('vi-VN')} ₫</td>
                      <td className="px-6 py-4 text-right">{(detail.quantity * parseFloat(detail.price)).toLocaleString('vi-VN')} ₫</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-700 flex justify-end flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-100 bg-gray-600 hover:bg-gray-500">Close</button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;