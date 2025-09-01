import { pascalCase } from 'scule';

/**
 * @descCN 获取导入名称
 */
export function getImportName(name: string) {
  const NUM_REG = /^\d+$/;

  let key = pascalCase(name);

  if (NUM_REG.test(name)) {
    key = `_${key}`;
  }

  return key;
}

/**
 * @descCN 转换为路由名称
 */
export function transformPathToName(path: string) {
  const newPath = path.replaceAll(':', '').replaceAll('?', '');

  return pascalCase(newPath.split('/').join('-'));
}
