import React, { useState, useEffect } from 'react';
import { Supplier } from '../../types';
import { X } from 'lucide-react';

type SupplierFormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  supplierToEdit?: Supplier | null;
}

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  supplierToEdit,
}) => {
  const initialFormState: SupplierFormData = {
    name: '',
    email: '',
    phone: '',
    address: '',
  };

  const [formData, setFormData] = useState<SupplierFormData>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof SupplierFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (supplierToEdit) {
        setFormData({
          name: supplierToEdit.name,
          email: supplierToEdit.email,
          phone: supplierToEdit.phone,
          address: supplierToEdit.address,
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
    }
  }, [supplierToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SupplierFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{9,15}$/.test(formData.phone)) {
        newErrors.phone = 'Phone number is invalid';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });
    } catch (error) {
      console.error("Failed to save supplier", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-8 max-h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">{supplierToEdit ? 'Edit Supplier' : 'Add New Supplier'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500" required />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500" required />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
              <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500" required />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">Address</label>
              <textarea name="address" id="address" value={formData.address} onChange={handleChange} rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500" required></textarea>
              {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-100 bg-gray-600 hover:bg-gray-500">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierFormModal;