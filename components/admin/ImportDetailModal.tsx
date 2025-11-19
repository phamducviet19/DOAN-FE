import React from 'react';
import { ImportReceipt } from '../../types';
import { X } from 'lucide-react';

interface ImportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ImportReceipt | null;
}

const ImportDetailModal: React.FC<ImportDetailModalProps> = ({ isOpen, onClose, receipt }) => {
  if (!isOpen || !receipt) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-gray-800 text-gray-200 rounded-lg shadow-xl w-full max-w-3xl p-8 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-100">Import Receipt Details - #{receipt.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>
        
        <div className="overflow-y-auto pr-4 -mr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Supplier Info</h3>
              <p><span className="font-medium text-gray-400">Name:</span> {receipt.Supplier.name}</p>
              <p><span className="font-medium text-gray-400">ID:</span> {receipt.supplier_id}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Receipt Summary</h3>
              <p><span className="font-medium text-gray-400">Import Date:</span> {new Date(receipt.import_date).toLocaleString()}</p>
              <p><span className="font-medium text-gray-400">Total:</span> {parseFloat(receipt.total_amount).toLocaleString('vi-VN')} ₫</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Imported Products</h3>
            <div className="overflow-x-auto bg-gray-900/50 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Product</th>
                    <th scope="col" className="px-6 py-3 text-center">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-right">Unit Price</th>
                    <th scope="col" className="px-6 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.ImportDetails.map(detail => (
                    <tr key={detail.id} className="border-b border-gray-700/50">
                      <td className="px-6 py-4 font-medium text-gray-100">{detail.Product.name}</td>
                      <td className="px-6 py-4 text-center">{detail.quantity}</td>
                      <td className="px-6 py-4 text-right">{parseFloat(detail.unit_price).toLocaleString('vi-VN')} ₫</td>
                      <td className="px-6 py-4 text-right">{(detail.quantity * parseFloat(detail.unit_price)).toLocaleString('vi-VN')} ₫</td>
                    </tr>
                  ))}
                   {receipt.ImportDetails.length === 0 && (
                     <tr>
                        <td colSpan={4} className="text-center py-4 text-gray-400">No product details available for this import.</td>
                    </tr>
                   )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-700 flex justify-end flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-100 bg-gray-600 hover:bg-gray-500">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ImportDetailModal;