import React, { useEffect, useState } from 'react';
import { categoryAPI } from '../api/categories';
import { useAuth } from '../context/AuthContext';
import { Add, Edit, Delete } from '@mui/icons-material';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading categories...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
        {isAdmin && (
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition">
            <Add fontSize="small" /> Add Category
          </button>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border">
          <p className="text-gray-500">No categories found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.iconName || '📁'}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                  <p className="text-xs text-gray-500">{cat.description || 'No description'}</p>
                </div>
              </div>
              {isAdmin && (
                <div className="flex justify-end gap-2 mt-2">
                  <button className="text-gray-400 hover:text-blue-600">
                    <Edit fontSize="small" />
                  </button>
                  <button className="text-gray-400 hover:text-red-600">
                    <Delete fontSize="small" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;