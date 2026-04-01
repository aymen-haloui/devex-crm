'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Quote, Calendar, User, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface FeedbackListProps {
    feedbacks: any[];
    onDelete: (id: string) => void;
}

export default function FeedbackList({ feedbacks, onDelete }: FeedbackListProps) {
    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'text-emerald-600 bg-emerald-50';
            case 'negative': return 'text-rose-600 bg-rose-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    if (feedbacks.length === 0) {
        return (
            <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-slate-50/50">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
                    <MessageSquare className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No customer feedback yet.</p>
                <p className="text-xs text-slate-400 mt-1">Collect and analyze the Voice of your Customers here.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedbacks.map((item) => (
                <Card key={item.id} className="group hover:shadow-md transition-all border-slate-200">
                    <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                        <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                                />
                            ))}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-600"
                            onClick={() => onDelete(item.id)}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Quote className="absolute -left-1 -top-1 w-4 h-4 text-slate-100 -scale-x-100" />
                            <p className="text-sm text-slate-700 italic px-4 line-clamp-4 leading-relaxed">
                                {item.comment}
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t pt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                    <User className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-900">
                                        {item.contact ? `${item.contact.firstName} ${item.contact.lastName}` : (item.customerName || 'Anonymous')}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                        {item.source || 'Manual Entry'}
                                    </span>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">
                                {format(new Date(item.createdAt), 'MMM dd')}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
