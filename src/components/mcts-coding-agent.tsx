"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Brain, Play, Pause, RefreshCw } from 'lucide-react';
import { APISettings } from './APISettings';
import { SearchMetrics } from './SearchMetrics';
import { NodeInfo } from './NodeInfo';
import { CodeEditor } from './CodeEditor';
import { TreeVisualization } from './TreeVisualization';
import { LanguageSelector } from './LanguageSelector';
import { OperatorPanel } from './OperatorPanel';
import { MCTSNode, expandNode, simulateNode, backpropagate, select } from '../utils/mcts-utils';
import { generateCodeWithAPI, OperatorType } from '../utils/api-utils';
import { SupportedLanguage, initializeTreeSitter } from '../utils/tree-sitter-utils';

const MCTSCodingAgent: React.FC = () => {
  const [root, setRoot] = useState<MCTSNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<MCTSNode | null>(null);
  const [iteration, setIteration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [searchMetrics, setSearchMetrics] = useState({
    totalNodes: 0,
    maxDepth: 0,
    avgValue: 0,
  });

  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gpt-4');
  const [siteUrl, setSiteUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('javascript');

  const { toast } = useToast();

  useEffect(() => {
    const storedApiKey = localStorage.getItem('openRouterApiKey');
    const storedModelName = localStorage.getItem('openRouterModelName');
    const storedSiteUrl = localStorage.getItem('siteUrl');
    const storedSiteName = localStorage.getItem('siteName');

    if (storedApiKey) setApiKey(storedApiKey);
    if (storedModelName) setModelName(storedModelName);
    if (storedSiteUrl) setSiteUrl(storedSiteUrl);
    if (storedSiteName) setSiteName(storedSiteName);

    initializeTreeSitter();
  }, []);

  const saveSettings = () => {
    localStorage.setItem('openRouterApiKey', apiKey);
    localStorage.setItem('openRouterModelName', modelName);
    localStorage.setItem('siteUrl', siteUrl);
    localStorage.setItem('siteName', siteName);
    toast({
      title: "Settings saved",
      description: "Your API settings have been saved to local storage.",
    });
  };

  // Initialize MCTS tree
  useEffect(() => {
    const initialState = {
      depth: 0,
      code: '',
      operators: [],
      language: selectedLanguage,
    };
    const rootNode = new MCTSNode(initialState);
    setRoot(rootNode);
  }, [selectedLanguage]);

  // Single MCTS iteration
  const runIteration = useCallback(async () => {
    if (!root) return;
    
    // Selection
    let node = select(root);
    
    // Expansion
    if (!node.isTerminal()) {
      const expandedNode = await expandNode(node, apiKey, modelName, siteUrl, siteName);
      if (expandedNode) {
        node = expandedNode;
      }
    }
    
    // Simulation
    const value = await simulateNode(node, apiKey, modelName, siteUrl, siteName);
    
    // Backpropagation
    backpropagate(node, value);
    
    setIteration(i => i + 1);
    updateMetrics();
  }, [root, apiKey, modelName, siteUrl, siteName]);

  // Update search metrics
  const updateMetrics = () => {
    if (!root) return;

    let totalNodes = 0;
    let maxDepth = 0;
    let totalValue = 0;
    
    const traverse = (node: MCTSNode, depth: number) => {
      totalNodes++;
      maxDepth = Math.max(maxDepth, depth);
      totalValue += node.value;
      
      for (const child of node.children) {
        traverse(child, depth + 1);
      }
    };
    
    traverse(root, 0);
    
    setSearchMetrics({
      totalNodes,
      maxDepth,
      avgValue: totalValue / totalNodes || 0,
    });
  };

  // Auto-run iterations
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(runIteration, speed);
    }
    return () => clearInterval(interval);
  }, [isRunning, speed, runIteration]);

  const onNodeClick = (node: MCTSNode) => {
    setSelectedNode(node);
  };

  const handleOperatorApply = async (operatorType: OperatorType) => {
    if (!selectedNode) return;

    const newState = {
      ...selectedNode.state,
      operators: [...selectedNode.state.operators, { type: operatorType, params: {} }],
    };

    const generatedCode = await generateCodeWithAPI(newState, apiKey, modelName, siteUrl, siteName);
    newState.code = generatedCode;

    const newNode = selectedNode.addChild(newState);
    setSelectedNode(newNode);
  };

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6" />
          MCTS Coding Agent
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start
                  </>
                )}
              </Button>
              <Button
                onClick={runIteration}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Step
              </Button>
              <div className="flex items-center gap-2">
                <Label htmlFor="speed">Speed (ms):</Label>
                <Input
                  id="speed"
                  type="number"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>

            <APISettings
              apiKey={apiKey}
              setApiKey={setApiKey}
              modelName={modelName}
              setModelName={setModelName}
              siteUrl={siteUrl}
              setSiteUrl={setSiteUrl}
              siteName={siteName}
              setSiteName={setSiteName}
              saveSettings={saveSettings}
            />

            <LanguageSelector
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
            />

            <SearchMetrics
              iteration={iteration}
              totalNodes={searchMetrics.totalNodes}
              maxDepth={searchMetrics.maxDepth}
              avgValue={searchMetrics.avgValue}
            />

            <NodeInfo selectedNode={selectedNode} />

            <OperatorPanel onOperatorApply={handleOperatorApply} />
          </div>

          <TreeVisualization root={root} onNodeClick={onNodeClick} />
        </div>

        <CodeEditor
          code={selectedNode?.state.code || ''}
          language={selectedLanguage}
          onChange={(newCode) => {
            if (selectedNode) {
              const updatedNode = new MCTSNode({
                ...selectedNode.state,
                code: newCode,
              }, selectedNode.parent);
              setSelectedNode(updatedNode);
            }
          }}
        />
      </CardContent>
    </Card>
  );
};

export default MCTSCodingAgent;
