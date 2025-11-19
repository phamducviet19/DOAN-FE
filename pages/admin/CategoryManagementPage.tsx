import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { Category } from '../../types';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import SimpleFormModal from '../../components/admin/SimpleFormModal';

const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Category[]>('/category');
      setCategories(Array.isArray(res) ? res : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, refreshTrigger]);

  const handleOpenAddModal = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (category: Category) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCategoryToEdit(null);
  };
  
  const handleSaveCategory = async (name: string) => {
    try {
      const payload = { name };
      if (categoryToEdit) {
        await api.put(`/category/${categoryToEdit.id}`, payload);
      } else {
        await api.post('/category', payload);
      }
      handleCloseModal();
      setRefreshTrigger(t => t + 1);
    } catch (err) {
      console.error("Failed to save category:", err);
      alert('Failed to save category. Please try again.');
      throw err;
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (window.confirm('Are you sure you want to delete this category? This might affect associated products.')) {
      try {
        await api.delete(`/category/${categoryId}`);
        setCategories(prev => prev.filter(c => c.id !== categoryId));
      } catch (error) {
        console.error('Failed to delete category', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };
  
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Category Management</h1>
        <div className="flex items-center space-x-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <button onClick={handleOpenAddModal} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500">
              <PlusCircle size={20} className="mr-2" /> Add Category
            </button>
        </div>
      </div>

      {loading && <p>Loading categories...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? filteredCategories.map(category => (
                <tr key={category.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="px-6 py-4">{category.id}</td>
                  <th scope="row" className="px-6 py-4 font-medium text-gray-100">{category.name}</th>
                  <td className="px-6 py-4 flex space-x-2">
                    <button onClick={() => handleOpenEditModal(category)} className="text-blue-400 hover:text-blue-300"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(category.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                  </td>
                </tr>
              )) : (
                 <tr>
                    <td colSpan={3} className="text-center py-6 text-gray-400">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <SimpleFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
        itemToEdit={categoryToEdit}
        title={categoryToEdit ? 'Edit Category' : 'Add New Category'}
        label="Category Name"
      />
    </div>
  );
};

export default CategoryManagementPage;