import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../services/api';
import { User } from '../../types';
import { Trash2, Search } from 'lucide-react';

const CustomerManagementPage: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 500);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ data: User[] }>('/customer');
      setCustomers(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) {
      return customers;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      customer.email.toLowerCase().includes(lowerCaseSearchTerm) ||
      (customer.phone && customer.phone.includes(lowerCaseSearchTerm))
    );
  }, [customers, searchTerm]);

  const handleDelete = async (customerId: number) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customer/${customerId}`);
        setCustomers(prev => prev.filter(c => c.id !== customerId));
      } catch (error) {
        console.error('Failed to delete customer', error);
        alert('Failed to delete customer. Please try again.');
      }
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Customer Management</h1>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
        </div>
      </div>
      {loading && <p>Loading customers...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Phone</th>
                <th scope="col" className="px-6 py-3">Joined</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                <tr key={customer.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="px-6 py-4">{customer.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-100">{customer.name}</td>
                  <td className="px-6 py-4">{customer.email}</td>
                  <td className="px-6 py-4">{customer.phone}</td>
                  <td className="px-6 py-4">{customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(customer.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                  </td>
                </tr>
              )) : (
                 <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-400">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerManagementPage;