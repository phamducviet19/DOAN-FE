import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { Eye, Edit, Search } from 'lucide-react';
import OrderDetailModal from '../../components/admin/OrderDetailModal';
import OrderStatusModal from '../../components/admin/OrderStatusModal';

const statusColors: { [key in OrderStatus]: string } = {
  Pending: 'bg-yellow-500/20 text-yellow-300',
  Confirmed: 'bg-blue-500/20 text-blue-300',
  Shipped: 'bg-green-500/20 text-green-300',
  Cancelled: 'bg-red-500/20 text-red-300',
};

const OrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters state
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 500);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ data: Order[] }>('/order');
      setOrders(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, refreshTrigger]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        const customerMatch = searchTerm
            ? order.User.name.toLowerCase().includes(lowerCaseSearchTerm) ||
              order.User.email.toLowerCase().includes(lowerCaseSearchTerm)
            : true;

        const statusMatch = statusFilter ? order.status === statusFilter : true;
        
        const orderDate = new Date(order.order_date);

        const startDateMatch = startDate ? orderDate >= new Date(startDate) : true;
        
        const endDateMatch = endDate ? orderDate <= new Date(new Date(endDate).setUTCHours(23, 59, 59, 999)) : true;
        
        return customerMatch && statusMatch && startDateMatch && endDateMatch;
    });
  }, [orders, searchTerm, statusFilter, startDate, endDate]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    try {
      await api.put(`/order/${selectedOrder.id}`, { status: newStatus });
      setIsStatusModalOpen(false);
      setSelectedOrder(null);
      setRefreshTrigger(t => t + 1); // Refresh data
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert('Failed to update status. Please try again.');
    }
  };

  const resetFilters = () => {
    setInputValue('');
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>
      
      <div className="bg-gray-800 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by customer..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as OrderStatus | '')}
          className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500 flex-grow min-w-[150px]"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Shipped">Shipped</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500 flex-grow min-w-[150px]"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500 flex-grow min-w-[150px]"
        />
        <button onClick={resetFilters} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors">
          Clear
        </button>
      </div>

      {loading && <p>Loading orders...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">Order ID</th>
                <th scope="col" className="px-6 py-3">Customer</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Total</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? filteredOrders.map(order => (
                <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="px-6 py-4 font-medium text-gray-100">#{order.id}</td>
                  <td className="px-6 py-4">{order.User.name}</td>
                  <td className="px-6 py-4">{new Date(order.order_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{parseFloat(order.total_amount).toLocaleString('vi-VN')} ₫</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex space-x-2">
                    <button onClick={() => handleViewDetails(order)} className="text-blue-400 hover:text-blue-300" title="View Details"><Eye size={18} /></button>
                    <button onClick={() => handleUpdateStatus(order)} className="text-green-400 hover:text-green-300" title="Update Status"><Edit size={18} /></button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {selectedOrder && (
        <>
          <OrderDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            order={selectedOrder}
          />
          <OrderStatusModal
            isOpen={isStatusModalOpen}
            onClose={() => setIsStatusModalOpen(false)}
            order={selectedOrder}
            onSave={handleSaveStatus}
          />
        </>
      )}
    </div>
  );
};

export default OrderManagementPage;