import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { experienceAPI } from '../api/experiences';
import { categoryAPI } from '../api/categories';
import { useAuth } from '../context/AuthContext';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';

const ExperiencesPage = () => {
  const [experiences, setExperiences] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, isLocalGuide } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expRes, catRes] = await Promise.all([
        experienceAPI.getAll(),
        categoryAPI.getAll()
      ]);
      setExperiences(expRes.data || []);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading experiences...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Experiences</h1>
        {(isAdmin || isLocalGuide) && (
          <button
            onClick={() => navigate('/experiences/new')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
          >
            <Add fontSize="small" /> Add Experience
          </button>
        )}
      </div>

      {experiences.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border">
          <p className="text-gray-500">No experiences found. Add your first experience!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp) => (
            <div key={exp.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
              {exp.coverImageUrl && (
                <img src={exp.coverImageUrl} alt={exp.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">{exp.title}</h3>
                <p className="text-sm text-gray-500">{exp.destinationName}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-indigo-600 font-bold">${exp.currentCalculatedPrice}</span>
                  <span className="text-xs text-gray-500">{exp.durationHours}h</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    exp.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    exp.status === 'PendingApproval' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {exp.status}
                  </span>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button className="text-gray-400 hover:text-indigo-600">
                    <Visibility fontSize="small" />
                  </button>
                  {isAdmin && (
                    <>
                      <button className="text-gray-400 hover:text-blue-600">
                        <Edit fontSize="small" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600">
                        <Delete fontSize="small" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperiencesPage;