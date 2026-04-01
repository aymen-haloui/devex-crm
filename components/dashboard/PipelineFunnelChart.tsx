"use client";
import { FunnelChart, Funnel, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import React from 'react';

interface PipelineFunnelChartProps {
    data: { stage: string; count: number }[];
}

const COLORS = ['#002a42', '#004d7a', '#0073b3', '#ff3131', '#ff6666', '#ffb3b3'];

export default function PipelineFunnelChart({ data }: PipelineFunnelChartProps) {
    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <FunnelChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#1E293B', fontWeight: 500 }}
                    />
                    <Funnel
                        dataKey="count"
                        data={data}
                        isAnimationActive
                        stroke="transparent"
                    >
                        <LabelList position="right" fill="#475569" stroke="none" dataKey="stage" />
                        {data?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Funnel>
                </FunnelChart>
            </ResponsiveContainer>
        </div>
    );
}
