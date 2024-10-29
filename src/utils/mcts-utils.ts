'use client'

import { Operator, OperatorType, generateCodeWithAPI } from './api-utils';
import { SupportedLanguage } from './tree-sitter-utils';

export interface MCTSState {
  depth: number;
  code: string;
  operators: Operator[];
  language: SupportedLanguage;
}

export class MCTSNode {
  state: MCTSState;
  parent: MCTSNode | null;
  children: MCTSNode[];
  visits: number;
  value: number;
  untriedOperators: OperatorType[];

  constructor(state: MCTSState, parent: MCTSNode | null = null) {
    this.state = state;
    this.parent = parent;
    this.children = [];
    this.visits = 0;
    this.value = 0;
    this.untriedOperators = this.getValidOperators();
  }

  getValidOperators(): OperatorType[] {
    return Object.values(OperatorType);
  }

  isTerminal(): boolean {
    return this.state.depth >= 5 || this.untriedOperators.length === 0;
  }

  addChild(childState: MCTSState): MCTSNode {
    const child = new MCTSNode(childState, this);
    this.children.push(child);
    return child;
  }
}

export function select(node: MCTSNode): MCTSNode {
  while (!node.isTerminal() && node.children.length > 0) {
    const λ = 0.4; // Balance between exploration and exploitation
    const α = 1.0; // Temperature parameter for score influence

    const uniformProb = 1 / node.children.length;
    const totalScore = node.children.reduce((sum, child) => sum + child.value, 0);
    
    const mixedProbs = node.children.map(child => {
      const scoreProb = Math.exp(α * (child.value / child.visits - totalScore / node.visits));
      return λ * uniformProb + (1 - λ) * scoreProb;
    });

    const normalizedProbs = mixedProbs.map(prob => prob / mixedProbs.reduce((a, b) => a + b, 0));
    
    const selectedIndex = weightedRandomChoice(normalizedProbs);
    node = node.children[selectedIndex];
  }
  return node;
}

function weightedRandomChoice(probabilities: number[]): number {
  const r = Math.random();
  let cumulativeProb = 0;
  for (let i = 0; i < probabilities.length; i++) {
    cumulativeProb += probabilities[i];
    if (r <= cumulativeProb) {
      return i;
    }
  }
  return probabilities.length - 1;
}

export async function expandNode(
  node: MCTSNode,
  apiKey: string,
  modelName: string,
  siteUrl: string,
  siteName: string
): Promise<MCTSNode | null> {
  if (node.untriedOperators.length === 0) return null;

  const operatorType = node.untriedOperators.pop()!;
  const newOperator: Operator = { type: operatorType, params: {} };

  const newState: MCTSState = {
    depth: node.state.depth + 1,
    code: node.state.code,
    operators: [...node.state.operators, newOperator],
    language: node.state.language,
  };

  const generatedCode = await generateCodeWithAPI(newState, apiKey, modelName, siteUrl, siteName);
  newState.code = generatedCode;

  return node.addChild(newState);
}

export async function simulateNode(
  node: MCTSNode,
  apiKey: string,
  modelName: string,
  siteUrl: string,
  siteName: string
): Promise<number> {
  // In a real implementation, this would execute the code and return a score
  // For simplicity, we'll use a random score between 0 and 1
  return Math.random();
}

export function backpropagate(node: MCTSNode, value: number): void {
  while (node) {
    node.visits++;
    node.value += value;
    node = node.parent!;
  }
}