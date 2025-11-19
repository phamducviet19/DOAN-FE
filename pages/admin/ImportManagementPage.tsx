import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../services/api';
import { ImportReceipt, Supplier } from '../../types';
import { PlusCircle, Trash2, Eye, Search } from 'lucide-react';
import ImportFormModal from '../../components/admin/ImportFormModal';
import ImportDetailModal from '../../components/admin/ImportDetailModal';

const ImportManagementPage: React.FC = () => {
  const [imports, setImports] = useState<ImportReceipt[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedImport, setSelectedImport] = useState<ImportReceipt | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filter states
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 500);
    return () => clearTimeout(handler);
  }, [inputValue]);

  // Fetch suppliers once
  useEffect(() => {
    const fetchSuppliers = async () => {
        try {
            const supplierData = await api.get<{ data: Supplier[] }>('/supplier');
            setSuppliers(Array.isArray(supplierData.data) ? supplierData.data : []);
        } catch (err) {
            console.error("Failed to fetch suppliers", err);
            setError('Failed to fetch suppliers for the form.');
        }
    }
    fetchSuppliers();
  }, []);

  const fetchImports = useCallback(async () => {
    setLoading(true);
    // Don't reset main error if we already have a supplier fetch error
    setError(prev => (prev ? prev : null));
    try {
      const data = await api.get<ImportReceipt[]>('/import');
      setImports(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch import receipts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImports();
  }, [fetchImports, refreshTrigger]);
  
  const filteredImports = useMemo(() => {
    return imports.filter(receipt => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        const supplierMatch = searchTerm
            ? receipt.Supplier.name.toLowerCase().includes(lowerCaseSearchTerm)
            : true;
        
        const importDate = new Date(receipt.import_date);

        const startDateMatch = startDate ? importDate >= new Date(startDate) : true;
        
        const endDateMatch = endDate ? importDate <= new Date(new Date(endDate).setUTCHours(23, 59, 59, 999)) : true;
        
        return supplierMatch && startDateMatch && endDateMatch;
    });
  }, [imports, searchTerm, startDate, endDate]);

  const resetFilters = () => {
    setInputValue('');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };
  
  const handleViewDetails = (receipt: ImportReceipt) => {
    setSelectedImport(receipt);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (receiptId: number) => {
    if (window.confirm('Are you sure you want to delete this import receipt? This will revert stock changes.')) {
      try {
        await api.delete(`/import/${receiptId}`);
        setImports(prev => prev.filter(i => i.id !== receiptId));
      } catch (error) {
        console.error('Failed to delete import receipt', error);
        alert('Failed to delete import receipt. Please try again.');
      }
    }
  };
  
  const handleSaveImport = async (importData: any) => {
    try {
      await api.post('/import', importData);
      setIsFormModalOpen(false);
      setRefreshTrigger(t => t + 1);
    } catch (err) {
      console.error("Failed to save import:", err);
      alert('Failed to save import receipt. Check the console for details.');
      throw err;
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Import Management</h1>
        <button onClick={() => setIsFormModalOpen(true)} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500">
          <PlusCircle size={20} className="mr-2" /> New Import
        </button>
      </div>

       <div className="bg-gray-800 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by supplier..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
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

      {loading && <p>Loading import receipts...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">Receipt ID</th>
                <th scope="col" className="px-6 py-3">Supplier</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Total Amount</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredImports.length > 0 ? filteredImports.map(receipt => (
                <tr key={receipt.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="px-6 py-4">{receipt.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-100">{receipt.Supplier.name}</td>
                  <td className="px-6 py-4">{new Date(receipt.import_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{parseFloat(receipt.total_amount).toLocaleString('vi-VN')} ₫</td>
                  <td className="px-6 py-4 flex space-x-2">
                    <button onClick={() => handleViewDetails(receipt)} className="text-blue-400 hover:text-blue-300" title="View Details"><Eye size={18} /></button>
                    <button onClick={() => handleDelete(receipt.id)} className="text-red-400 hover:text-red-300" title="Delete Receipt"><Trash2 size={18} /></button>
                  </td>
                </tr>
              )) : (
                 <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-400">No import receipts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <ImportFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveImport}
        suppliers={suppliers}
      />
      {selectedImport && (
        <ImportDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            receipt={selectedImport}
        />
      )}
    </div>
  );
};

export default ImportManagementPage;