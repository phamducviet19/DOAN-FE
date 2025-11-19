import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../services/api';
import { Supplier } from '../../types';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import SupplierFormModal from '../../components/admin/SupplierFormModal';

const SupplierManagementPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 500);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ data: Supplier[] }>('/supplier');
      setSuppliers(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers, refreshTrigger]);

  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) {
        return suppliers;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        supplier.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        (supplier.phone && supplier.phone.includes(lowerCaseSearchTerm))
    );
  }, [suppliers, searchTerm]);

  const handleOpenAddModal = () => {
    setSupplierToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setSupplierToEdit(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSupplierToEdit(null);
  };

  const handleSaveSupplier = async (supplierData: Omit<Supplier, 'id'>) => {
    try {
      if (supplierToEdit) {
        await api.put(`/supplier/${supplierToEdit.id}`, supplierData);
      } else {
        await api.post('/supplier', supplierData);
      }
      handleCloseModal();
      setRefreshTrigger(t => t + 1);
    } catch (err) {
        console.error("Failed to save supplier:", err);
        alert('Failed to save supplier. Please check the console for details.');
        throw err;
    }
  };

  const handleDelete = async (supplierId: number) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await api.delete(`/supplier/${supplierId}`);
        setSuppliers(prev => prev.filter(s => s.id !== supplierId));
      } catch (error) {
        console.error('Failed to delete supplier', error);
        alert('Failed to delete supplier. Please try again.');
      }
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Supplier Management</h1>
        <div className="flex items-center space-x-4">
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
            <button onClick={handleOpenAddModal} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500">
            <PlusCircle size={20} className="mr-2" /> Add Supplier
            </button>
        </div>
      </div>

      {loading && <p>Loading suppliers...</p>}
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
                <th scope="col" className="px-6 py-3">Address</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length > 0 ? filteredSuppliers.map(supplier => (
                <tr key={supplier.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="px-6 py-4">{supplier.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-100">{supplier.name}</td>
                  <td className="px-6 py-4">{supplier.email}</td>
                  <td className="px-6 py-4">{supplier.phone}</td>
                  <td className="px-6 py-4">{supplier.address}</td>
                  <td className="px-6 py-4 flex space-x-2">
                    <button onClick={() => handleOpenEditModal(supplier)} className="text-blue-400 hover:text-blue-300"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(supplier.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-400">No suppliers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSupplier}
        supplierToEdit={supplierToEdit}
      />
    </div>
  );
};

export default SupplierManagementPage;