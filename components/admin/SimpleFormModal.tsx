import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Item {
  id: number;
  name: string;
}

interface SimpleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  itemToEdit?: Item | null;
  title: string;
  label: string;
}

const SimpleFormModal: React.FC<SimpleFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
  title,
  label,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(itemToEdit ? itemToEdit.name : '');
      setError('');
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave(name);
    } catch (error) {
      console.error(`Failed to save ${label}`, error);
      // Let the caller handle UI feedback like alerts
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-100 bg-gray-600 hover:bg-gray-500">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleFormModal;