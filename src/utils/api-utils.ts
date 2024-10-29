import { MCTSState } from './mcts-utils';

export enum OperatorType {
  GENERATE = 'generate',
  REFINE = 'refine',
  TEST = 'test',
  ENSEMBLE = 'ensemble',
}

export interface Operator {
  type: OperatorType;
  params: Record<string, any>;
}

export async function generateCodeWithAPI(
  state: MCTSState,
  apiKey: string,
  modelName: string,
  siteUrl: string,
  siteName: string
): Promise<string> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": siteUrl,
        "X-Title": siteName,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": modelName,
        "messages": [
          {
            "role": "system",
            "content": `You are a coding assistant. Generate or modify code based on the given instructions and current state. The code should be in ${state.language}.`
          },
          {
            "role": "user",
            "content": `Current code:\n${state.code}\n\nOperators: ${JSON.stringify(state.operators)}\n\nGenerate or modify the code based on the current state and operators.`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating code:', error);
    return state.code; // Return the original code if there's an error
  }
}