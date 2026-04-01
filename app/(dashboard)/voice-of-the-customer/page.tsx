'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, MessageSquare, Search, Filter, TrendingUp, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FeedbackList from '@/components/voc/FeedbackList';
import FeedbackForm from '@/components/voc/FeedbackForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function VoiceOfTheCustomerPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/feedbacks');
      const json = await res.json();
      if (json.success) setFeedbacks(json.data);
    } catch (error) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleSubmit = async (data: any) => {
    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Feedback recorded');
        setIsAdding(false);
        fetchFeedbacks();
      }
    } catch (error) {
      toast.error('Failed to save feedback');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      const res = await fetch(`/api/feedbacks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Feedback deleted');
        fetchFeedbacks();
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((acc: any, curr: any) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  if (isAdding) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <FeedbackForm onSubmit={handleSubmit} onCancel={() => setIsAdding(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="px-8 py-6 flex items-center justify-between bg-white border-b shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-100">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Voice of the Customer</h1>
            <p className="text-sm text-slate-500 font-medium">Insights and feedback from your client base</p>
          </div>
        </div>
        <Button onClick={() => setIsAdding(true)} className="h-10 px-6 font-bold rounded-xl shadow-lg shadow-indigo-200">
          <Plus className="w-4 h-4 mr-2" /> New Entry
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Feedback</p>
                  <p className="text-3xl font-bold text-slate-900">{feedbacks.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-slate-900">{avgRating}</p>
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sentiment Trend</p>
                  <p className="text-3xl font-bold text-slate-900">Positive</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 font-medium animate-pulse italic">
            Gathering insights...
          </div>
        ) : (
          <FeedbackList feedbacks={feedbacks} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
