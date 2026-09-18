import React, { useEffect, useState } from 'react';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tripAPI } from '../api/trips';
import TripForm from '../components/trips/TripForm';

const TripBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) return;
    const load = async () => {
      try {
        const response = await tripAPI.getById(id);
        setTrip(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load this trip.');
      } finally { setLoading(false); }
    };
    load();
  }, [editing, id]);

  const submit = async (data) => {
    setSaving(true);
    try {
      console.log("Data", data)
      const response = editing ? await tripAPI.update(id, data) : await tripAPI.create(data);
      console.log("Response", response)
      const saved = response.data;
      toast.success(editing ? 'Trip updated successfully.' : 'Trip created successfully.');
      navigate(`/trips/${saved?.id || id}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save trip.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-sm text-slate-500">Loading trip...</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <button type="button" onClick={() => navigate('/trips')} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-indigo-700"><ArrowBack fontSize="small" /> Back to Trips</button>
      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <TripForm initialValues={trip} loading={saving} onSubmit={submit} onCancel={() => navigate('/trips')} />
    </div>
  );
};

export default TripBuilderPage;
