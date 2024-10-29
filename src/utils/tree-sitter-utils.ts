import Parser from 'web-tree-sitter';

export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'rust';

const parsers: Record<SupportedLanguage, Parser | null> = {
  javascript: null,
  typescript: null,
  python: null,
  rust: null,
};

export async function initializeTreeSitter() {
  await Parser.init();

  const languages: SupportedLanguage[] = ['javascript', 'typescript', 'python', 'rust'];

  for (const lang of languages) {
    parsers[lang] = new Parser();
    const langWasm = await Parser.Language.load(`/tree-sitter-${lang}.wasm`);
    parsers[lang]!.setLanguage(langWasm);
  }
}

export function parseCode(code: string, language: SupportedLanguage) {
  const parser = parsers[language];
  if (!parser) {
    throw new Error(`TreeSitter parser not initialized for ${language}`);
  }
  return parser.parse(code);
}

export function getASTFromCode(code: string, language: SupportedLanguage) {
  const tree = parseCode(code, language);
  return tree.rootNode;
}

export function traverseAST(node: Parser.SyntaxNode, callback: (node: Parser.SyntaxNode) => void) {
  callback(node);
  for (let i = 0; i < node.childCount; i++) {
    traverseAST(node.child(i)!, callback);
  }
}

export function analyzeAST(code: string, language: SupportedLanguage) {
  const ast = getASTFromCode(code, language);
  let functionCount = 0;
  let classCount = 0;
  let variableCount = 0;

  traverseAST(ast, (node) => {
    switch (node.type) {
      case 'function_declaration':
      case 'function_definition':
        functionCount++;
        break;
      case 'class_declaration':
      case 'class_definition':
        classCount++;
        break;
      case 'variable_declaration':
        variableCount++;
        break;
    }
  });

  return { functionCount, classCount, variableCount };
}