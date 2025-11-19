import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { X } from 'lucide-react';

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newStatus: OrderStatus) => Promise<void>;
  order: Order | null;
}

const OrderStatusModal: React.FC<OrderStatusModalProps> = ({ isOpen, onClose, onSave, order }) => {
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setNewStatus(order.status);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(newStatus);
    } catch (error) {
      // Error is handled by the caller, just log it here
      console.error("Failed to save status", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'Shipped', 'Cancelled'];
  const isShipped = order.status === 'Shipped';
  const isCancelled = order.status === 'Cancelled';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Update Order Status</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4 text-gray-200">
            <p>Order ID: <span className="font-bold text-gray-100">#{order.id}</span></p>
            <p>Current Status: <span className="font-bold text-gray-100">{order.status}</span></p>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">New Status</label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={isShipped || isCancelled}
              >
                {availableStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
               {isShipped && <p className="text-yellow-400 text-xs mt-2">Shipped orders cannot have their status changed.</p>}
               {isCancelled && <p className="text-red-400 text-xs mt-2">Cancelled orders cannot have their status changed.</p>}
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-100 bg-gray-600 hover:bg-gray-500">Cancel</button>
            <button type="submit" disabled={isSubmitting || newStatus === order.status || isShipped || isCancelled} className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : 'Save Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderStatusModal;