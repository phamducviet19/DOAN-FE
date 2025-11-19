import React, { useEffect } from 'react';
import { usePCBuild } from '../../contexts/PCBuildContext';
import { Link } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import { Trash2, Edit, PlusCircle, Wrench } from 'lucide-react';

const PCBuildListPage: React.FC = () => {
  const { builds, loading, deleteBuild, fetchBuilds } = usePCBuild();

  useEffect(() => {
    fetchBuilds();
  }, [fetchBuilds]);
  
  const calculateTotal = (build: any) => {
    return build.PcBuildDetails.reduce((acc: number, detail: any) => acc + parseFloat(detail.Product.price), 0);
  };

  const handleDelete = (id: number) => {
      if (window.confirm('Are you sure you want to delete this build?')) {
          deleteBuild(id);
      }
  }

  return (
    <div className="bg-primary p-6 rounded-lg shadow-sm border border-border-color">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-4 sm:mb-0">My PC Builds</h1>
        <Link 
          to="/pcbuild/new"
          className="inline-flex items-center bg-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-highlight transition-colors"
        >
          <PlusCircle size={20} className="mr-2" />
          Create New Build
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64"><Spinner /></div>
      )}

      {!loading && builds.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-border-color rounded-lg">
            <Wrench className="mx-auto h-12 w-12 text-text-secondary" />
            <h3 className="mt-2 text-xl font-semibold text-text-primary">No Builds Yet</h3>
            <p className="mt-1 text-text-secondary">Start creating your custom PC build today!</p>
        </div>
      )}

      {!loading && builds.length > 0 && (
        <div className="space-y-4">
          {builds.map(build => (
            <div key={build.id} className="p-4 border border-border-color rounded-md bg-secondary flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-grow">
                <h2 className="text-lg font-semibold text-text-primary">{build.name}</h2>
                <p className="text-sm text-text-secondary">Created: {new Date(build.created_at).toLocaleDateString()}</p>
                <p className="text-md font-bold text-accent mt-2">Total: {calculateTotal(build).toLocaleString('vi-VN')} ₫</p>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Link to={`/pcbuild/${build.id}`} className="p-2 text-text-secondary hover:bg-gray-200 rounded-full" title="Edit Build">
                  <Edit size={18} />
                </Link>
                <button onClick={() => handleDelete(build.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Delete Build">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PCBuildListPage;