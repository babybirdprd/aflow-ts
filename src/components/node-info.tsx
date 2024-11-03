'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { MCTSNode } from '../utils/mcts-utils';

interface NodeInfoProps {
  selectedNode: MCTSNode | null;
}

export const NodeInfo: React.FC<NodeInfoProps> = ({ selectedNode }) => {
  if (!selectedNode) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Node Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <div>Depth:</div>
          <div>{selectedNode.state.depth}</div>
          <div>Visits:</div>
          <div>{selectedNode.visits}</div>
          <div>Value:</div>
          <div>{selectedNode.value.toFixed(4)}</div>
          <div>Operators:</div>
          <div>{selectedNode.state.operators.map(op => op.type).join(', ')}</div>
        </div>
      </CardContent>
    </Card>
  );
};
