import React, { useState, useEffect } from 'react';
import { Supplier, Product } from '../../types';
import { X, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';

type ImportDetailData = {
  product_id: string;
  quantity: string;
  unit_price: string;
};

type ImportFormData = {
  supplier_id: string;
  import_date: string;
  details: ImportDetailData[];
};

interface ImportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (importData: { supplier_id: number; import_date: string; details: {product_id: number; quantity: number; unit_price: string}[] }) => Promise<void>;
  suppliers: Supplier[];
}

const ImportFormModal: React.FC<ImportFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  suppliers,
}) => {
  const initialFormState: ImportFormData = {
    supplier_id: '',
    import_date: new Date().toISOString().split('T')[0], // Default to today
    details: [{ product_id: '', quantity: '1', unit_price: '' }],
  };

  const [formData, setFormData] = useState<ImportFormData>(initialFormState);
  const [products, setProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (isOpen) {
        try {
          const response = await api.get<Product[]>('/product');
          setProducts(Array.isArray(response) ? response : []);
        } catch (error) {
          console.error("Failed to fetch products", error);
        }
      }
    };
    fetchProducts();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: any = { details: [] };
    if (!formData.supplier_id) newErrors.supplier_id = 'Supplier is required';
    if (!formData.import_date) newErrors.import_date = 'Import date is required';
    if (formData.details.length === 0) {
      newErrors.general = 'At least one product must be added to the import.';
    }

    let detailsAreValid = true;
    formData.details.forEach((detail, index) => {
      const detailErrors: any = {};
      if (!detail.product_id) {
        detailErrors.product_id = 'Product is required';
        detailsAreValid = false;
      }
      if (!detail.quantity || isNaN(Number(detail.quantity)) || Number(detail.quantity) <= 0 || !Number.isInteger(Number(detail.quantity))) {
        detailErrors.quantity = 'Must be a positive integer';
        detailsAreValid = false;
      }
      if (!detail.unit_price || isNaN(Number(detail.unit_price)) || Number(detail.unit_price) <= 0) {
        detailErrors.unit_price = 'Must be a positive number';
        detailsAreValid = false;
      }
      if (Object.keys(detailErrors).length > 0) {
        newErrors.details[index] = detailErrors;
      }
    });

    setErrors(newErrors);
    return !newErrors.supplier_id && !newErrors.import_date && !newErrors.general && detailsAreValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newDetails = [...formData.details];
    newDetails[index] = { ...newDetails[index], [name]: value };
    setFormData(prev => ({ ...prev, details: newDetails }));
  };

  const addDetailRow = () => {
    setFormData(prev => ({
      ...prev,
      details: [...prev.details, { product_id: '', quantity: '1', unit_price: '' }],
    }));
  };

  const removeDetailRow = (index: number) => {
    const newDetails = formData.details.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, details: newDetails }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        supplier_id: Number(formData.supplier_id),
        import_date: formData.import_date,
        details: formData.details.map(d => ({
          product_id: Number(d.product_id),
          quantity: Number(d.quantity),
          unit_price: d.unit_price,
        })),
      };
      await onSave(payload);
    } catch (error) {
        console.error("Failed to save import receipt", error);
        // Error is handled on the management page
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const totalAmount = formData.details.reduce((acc, detail) => {
    const quantity = Number(detail.quantity) || 0;
    const price = Number(detail.unit_price) || 0;
    return acc + (quantity * price);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-8 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-100">New Import Receipt</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>
        <form id="importForm" onSubmit={handleSubmit} noValidate className="flex-grow overflow-y-auto pr-4 -mr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-300 mb-1">Supplier</label>
              <select name="supplier_id" id="supplier_id" value={formData.supplier_id} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500" required>
                <option value="">Select a supplier</option>
                {suppliers.map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
              </select>
              {errors.supplier_id && <p className="text-red-400 text-xs mt-1">{errors.supplier_id}</p>}
            </div>
            <div>
              <label htmlFor="import_date" className="block text-sm font-medium text-gray-300 mb-1">Import Date</label>
              <input type="date" name="import_date" id="import_date" value={formData.import_date} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500" required />
              {errors.import_date && <p className="text-red-400 text-xs mt-1">{errors.import_date}</p>}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-100 mb-4">Products</h3>
          <div className="space-y-4">
            {formData.details.map((detail, index) => (
              <div key={index} className="grid grid-cols-12 gap-x-4 items-start bg-gray-900/50 p-3 rounded-md">
                <div className="col-span-6">
                  <label htmlFor={`product_id_${index}`} className="block text-xs font-medium text-gray-400 mb-1">Product</label>
                  <select name="product_id" id={`product_id_${index}`} value={detail.product_id} onChange={e => handleDetailChange(index, e)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500 text-sm" required>
                    <option value="">Select a product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  {errors.details?.[index]?.product_id && <p className="text-red-400 text-xs mt-1">{errors.details[index].product_id}</p>}
                </div>
                 <div className="col-span-2">
                  <label htmlFor={`quantity_${index}`} className="block text-xs font-medium text-gray-400 mb-1">Quantity</label>
                  <input type="number" name="quantity" id={`quantity_${index}`} value={detail.quantity} onChange={e => handleDetailChange(index, e)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500 text-sm" min="1" required />
                  {errors.details?.[index]?.quantity && <p className="text-red-400 text-xs mt-1">{errors.details[index].quantity}</p>}
                </div>
                <div className="col-span-3">
                  <label htmlFor={`unit_price_${index}`} className="block text-xs font-medium text-gray-400 mb-1">Unit Price (₫)</label>
                  <input type="number" name="unit_price" id={`unit_price_${index}`} value={detail.unit_price} onChange={e => handleDetailChange(index, e)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500 text-sm" step="0.01" min="0" required />
                  {errors.details?.[index]?.unit_price && <p className="text-red-400 text-xs mt-1">{errors.details[index].unit_price}</p>}
                </div>
                <div className="col-span-1 flex items-end h-full">
                  <button type="button" onClick={() => removeDetailRow(index)} className="text-red-400 hover:text-red-300 p-2" aria-label="Remove item">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addDetailRow} className="mt-4 flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium">
            <Plus size={16} className="mr-1" /> Add Product
          </button>
          {errors.general && <p className="text-red-400 text-sm mt-4">{errors.general}</p>}
        </form>
        
        <div className="mt-8 pt-4 border-t border-gray-700 flex justify-between items-center flex-shrink-0">
            <div>
                <span className="text-gray-400">Total Amount: </span>
                <span className="text-xl font-bold text-gray-100">{Math.round(totalAmount).toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="flex space-x-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-100 bg-gray-600 hover:bg-gray-500">Cancel</button>
                <button type="submit" form="importForm" disabled={isSubmitting} className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Saving...' : 'Save Import'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImportFormModal;