import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../types';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';

type Tab = 'profile' | 'orders';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-1/4">
        <nav className="bg-primary p-4 rounded-lg shadow-sm border border-border-color">
          <ul>
            <li>
              <button 
                onClick={() => setActiveTab('profile')} 
                className={`w-full text-left font-semibold p-3 rounded-md transition-colors ${activeTab === 'profile' ? 'bg-highlight/10 text-accent' : 'text-text-primary hover:bg-gray-100'}`}
              >
                My Profile
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('orders')} 
                className={`w-full text-left font-semibold p-3 rounded-md transition-colors ${activeTab === 'orders' ? 'bg-highlight/10 text-accent' : 'text-text-primary hover:bg-gray-100'}`}
              >
                My Orders
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <div className="md:w-3/4 bg-primary p-6 rounded-lg shadow-sm border border-border-color">
        {activeTab === 'profile' && <ProfileDetails />}
        {activeTab === 'orders' && <OrderHistory />}
      </div>
    </div>
  );
};

// Profile Details Component
const ProfileDetails: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, phone: user.phone, address: user.address });
    }
  }, [user]);
  
  const commonInputClass = "mt-1 block w-full border-border-color bg-secondary rounded-md shadow-sm focus:ring-accent focus:border-accent";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    try {
      const payload: any = { ...formData };
      if (password) payload.password = password;
      await api.put('/profile', payload);
      setMessage({type: 'success', text: 'Profile updated successfully!'});
      setPassword(''); // Clear password field on success
    } catch(err: any) {
        setMessage({type: 'error', text: err.message || 'Failed to update profile.'});
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-text-primary">My Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary">Full Name</label>
          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={commonInputClass}/>
        </div>
         <div>
          <label className="block text-sm font-medium text-text-secondary">Email (cannot be changed)</label>
          <input type="email" value={user?.email || ''} readOnly disabled className={`${commonInputClass} bg-gray-100 cursor-not-allowed`}/>
        </div>
         <div>
          <label className="block text-sm font-medium text-text-secondary">Phone</label>
          <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={commonInputClass}/>
        </div>
         <div>
          <label className="block text-sm font-medium text-text-secondary">Address</label>
          <textarea rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={commonInputClass}/>
        </div>
         <div>
          <label className="block text-sm font-medium text-text-secondary">New Password (leave blank to keep current)</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={commonInputClass}/>
        </div>
        {message && <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message.text}</div>}
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-accent text-white rounded-md hover:bg-highlight disabled:bg-gray-400">
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

// Order History Component
const OrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<{ success: boolean; data: Order[] }>('/order');
            setOrders(res.data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch orders.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleCancelOrder = async (orderId: number) => {
        if(window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await api.patch(`/order/${orderId}/cancel`, {});
                fetchOrders();
            } catch (err: any) {
                alert(err.message || 'Failed to cancel order.');
            }
        }
    }

    if(loading) return <div className="flex justify-center"><Spinner /></div>;
    if(error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-text-primary">My Orders</h2>
            {orders.length === 0 ? (
                <p className="text-text-secondary">You have not placed any orders yet.</p>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="border border-border-color bg-secondary p-4 rounded-md">
                            <div className="flex flex-col sm:flex-row justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg text-text-primary">Order #{order.id}</p>
                                    <p className="text-sm text-text-secondary">Date: {new Date(order.order_date).toLocaleDateString()}</p>
                                    <p className="text-sm text-text-secondary">Status: <span className="font-semibold">{order.status}</span></p>
                                </div>
                                <div className="text-left sm:text-right mt-2 sm:mt-0">
                                    <p className="font-bold text-lg text-text-primary">{parseFloat(order.total_amount).toLocaleString('vi-VN')} ₫</p>
                                    {order.status === 'Pending' && (
                                        <button onClick={() => handleCancelOrder(order.id)} className="text-xs text-red-500 hover:underline mt-1">Cancel Order</button>
                                    )}
                                </div>
                            </div>
                            <div className="border-t border-border-color mt-2 pt-2">
                                {order.OrderDetails.map(detail => (
                                    <div key={detail.id} className="text-sm flex justify-between text-text-secondary">
                                        <span>{detail.Product.name} (x{detail.quantity})</span>
                                        <span>{(detail.quantity * parseFloat(detail.price)).toLocaleString('vi-VN')} ₫</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProfilePage;