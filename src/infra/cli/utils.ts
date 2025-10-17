import * as path from 'path';

/**
 * Verifica se estamos dentro do código do framework (vs. em um projeto que usa o framework)
 */
export function isInsideFramework(): boolean {
  const currentDir = process.cwd();
  // Verifica se o package.json tem o nome "framework-reactjs-api"
  try {
    const packagePath = path.join(currentDir, 'package.json');
    const packageJson = require(packagePath);
    return packageJson.name === 'framework-reactjs-api';
  } catch (error) {
    // Se não conseguir ler package.json, assume que não estamos no framework
    return false;
  }
}