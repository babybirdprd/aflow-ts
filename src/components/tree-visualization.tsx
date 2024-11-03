'use client'

import React from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { MCTSNode } from '../utils/mcts-utils';

interface TreeVisualizationProps {
  root: MCTSNode | null;
  onNodeClick: (node: MCTSNode) => void;
}

export const TreeVisualization: React.FC<TreeVisualizationProps> = ({ root, onNodeClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  React.useEffect(() => {
    if (root) {
      const { nodes, edges } = createReactFlowElements(root);
      setNodes(nodes);
      setEdges(edges);
    }
  }, [root]);

  const createReactFlowElements = (root: MCTSNode) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let id = 0;

    const traverse = (node: MCTSNode, x: number, y: number, parentId: string | null) => {
      const nodeId = `${id++}`;
      nodes.push({
        id: nodeId,
        data: { 
          label: `Depth: ${node.state.depth}\nVisits: ${node.visits}\nValue: ${node.value.toFixed(2)}`,
          node: node
        },
        position: { x, y },
      });

      if (parentId !== null) {
        edges.push({
          id: `e${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'smoothstep',
        });
      }

      const childWidth = 150;
      const childrenWidth = node.children.length * childWidth;
      const startX = x - childrenWidth / 2 + childWidth / 2;

      node.children.forEach((child, index) => {
        traverse(child, startX + index * childWidth, y + 100, nodeId);
      });
    };

    traverse(root, 0, 0, null);
    return { nodes, edges };
  };

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    onNodeClick(node.data.node);
  };

  return (
    <div className="h-[400px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};
