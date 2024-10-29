'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';

interface SearchMetricsProps {
  iteration: number;
  totalNodes: number;
  maxDepth: number;
  avgValue: number;
}

export const SearchMetrics: React.FC<SearchMetricsProps> = ({
  iteration,
  totalNodes,
  maxDepth,
  avgValue,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <div>Iteration:</div>
          <div>{iteration}</div>
          <div>Total Nodes:</div>
          <div>{totalNodes}</div>
          <div>Max Depth:</div>
          <div>{maxDepth}</div>
          <div>Avg Value:</div>
          <div>{avgValue.toFixed(4)}</div>
        </div>
      </CardContent>
    </Card>
  );
};