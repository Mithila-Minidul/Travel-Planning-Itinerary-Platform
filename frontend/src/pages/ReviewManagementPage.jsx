import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reviewAPI } from '../api/reviews';
import { Star, Reply, RateReview, Edit, Delete, Close } from '@mui/icons-material';
import toast from 'react-hot-toast';

const ReviewManagementPage = () => {
  const { isAdmin, isLocalGuide } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Reply state
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isEditingReply, setIsEditingReply] = useState(false);

  // Review edit state (Admin only)
  const [editReviewId, setEditReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = isAdmin ? await reviewAPI.getAll() : await reviewAPI.getForGuide();
      setReviews(res.data || []);
    } catch (e) {
      toast.error('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await reviewAPI.reply(replyId, replyText.trim());
      toast.success(isEditingReply ? 'Reply updated!' : 'Reply sent!');
      setReplyId(null);
      setReplyText('');
      setIsEditingReply(false);
      fetchReviews();
    } catch (e) {
      toast.error('Failed to send reply.');
    }
  };

  const handleDeleteReply = async (id) => {
    if (!window.confirm('Delete your reply?')) return;
    try {
      await reviewAPI.deleteReply(id);
      toast.success('Reply deleted.');
      fetchReviews();
    } catch (e) {
      toast.error('Failed to delete reply.');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await reviewAPI.delete(id);
      toast.success('Review deleted.');
      fetchReviews();
    } catch (e) {
      toast.error('Failed to delete review.');
    }
  };

  const handleUpdateReview = async () => {
    try {
      await reviewAPI.update(editReviewId, editRating, editComment);
      toast.success('Review updated!');
      setEditReviewId(null);
      fetchReviews();
    } catch (e) {
      toast.error('Failed to update review.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading reviews...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <RateReview className="text-indigo-600" /> Reviews & Ratings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isAdmin ? 'View and manage all reviews across the platform.' : 'Reply to reviews left for your experiences.'}
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed text-center text-slate-500">
          No reviews found.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white p-5 rounded-xl border shadow-sm">
              {/* Review Header */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  {/* 👇 ADDED: Traveler Profile Photo */}
                  {r.travelerProfileImageUrl ? (
                    <img
                      src={r.travelerProfileImageUrl}
                      alt={r.travelerName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                      {(r.travelerName || 'T')[0].toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-slate-800">{r.experienceTitle}</h3>
                    <p className="text-xs text-slate-500">By {r.travelerName} • {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} fontSize="small" sx={{ color: i < r.rating ? '#f59e0b' : '#d1d5db' }} />
                    ))}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button onClick={() => { setEditReviewId(r.id); setEditRating(r.rating); setEditComment(r.comment); }} className="text-slate-400 hover:text-indigo-600"><Edit fontSize="small" /></button>
                      <button onClick={() => handleDeleteReview(r.id)} className="text-slate-400 hover:text-red-600"><Delete fontSize="small" /></button>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Edit Form (Admin) */}
              {editReviewId === r.id ? (
                <div className="bg-slate-50 p-3 rounded-lg mb-3 border">
                  <div className="flex gap-1 mb-2">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} fontSize="small" onClick={() => setEditRating(star)} sx={{ cursor: 'pointer', color: star <= editRating ? '#f59e0b' : '#d1d5db' }} />
                    ))}
                  </div>
                  <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} rows="2" className="w-full border p-2 rounded text-sm mb-2" />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditReviewId(null)} className="text-xs text-slate-500">Cancel</button>
                    <button onClick={handleUpdateReview} className="bg-indigo-600 text-white text-xs px-3 py-1 rounded">Save</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-700 mb-3">{r.comment}</p>
              )}

              {/* Guide Reply Section */}
              {replyId === r.id ? (
                // 👇 EDIT / NEW REPLY FORM (This now takes priority)
                <div className="mt-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows="2"
                    placeholder="Write your reply..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => { setReplyId(null); setIsEditingReply(false); setReplyText(''); }} className="text-xs text-slate-500 hover:underline">Cancel</button>
                    <button onClick={handleReply} className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700">Save Reply</button>
                  </div>
                </div>
              ) : r.guideReply ? (
                // 👇 DISPLAY EXISTING REPLY
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-indigo-700 mb-1">Your Reply</p>
                      <p className="text-sm text-indigo-900">{r.guideReply}</p>
                      <p className="text-[10px] text-indigo-400 mt-1">{new Date(r.repliedAt).toLocaleString()}</p>
                    </div>
                    {(isLocalGuide || isAdmin) && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setReplyId(r.id); setReplyText(r.guideReply); setIsEditingReply(true); }} 
                          className="text-indigo-400 hover:text-indigo-700"
                        >
                          <Edit fontSize="small" />
                        </button>
                        <button 
                          onClick={() => handleDeleteReply(r.id)} 
                          className="text-indigo-400 hover:text-red-600"
                        >
                          <Delete fontSize="small" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // 👇 NEW REPLY BUTTON
                isLocalGuide && (
                  <button
                    onClick={() => { setReplyId(r.id); setReplyText(''); setIsEditingReply(true); }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
                  >
                    <Reply fontSize="small" /> Reply to Review
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewManagementPage;