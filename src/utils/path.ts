import { normalizePath } from 'unplugin-utils';

/**
 * resolve import path
 * @descCN 将文件系统路径转换为适合导入语句的路径
 * @param filePath - file path 需要转换的原始文件路径
 * @param alias - alias 	路径别名映射表（如 { '@': 'src' }）
 * @returns resolved path
 */
export function resolveImportPath(filePath: string, alias: Record<string, string>) {
  let newPath = normalizePath(filePath);

  const aliasEntries = Object.entries(alias);

  // 遍历别名映射表，将路径中的别名替换为实际路径
  aliasEntries.forEach((item) => {
    const [aliasPrefix, aliasPath] = item; // aliasPrefix=别名前缀, aliasPath=实际路径
    const normalizedDir = normalizePath(aliasPath); // 规范化路径
    const match = newPath.startsWith(normalizedDir); // 判断路径是否以实际路径开头

    if (match) {
      // 如果路径以实际路径开头，则替换为别名
      newPath = newPath.replace(normalizedDir, aliasPrefix);
    }

    return match; // 找到第一个匹配就停止
  });

  // 扩展名列表
  const exts = ['.tsx', '.jsx'];

  // 如果路径以扩展名结尾，则删除扩展名
  const findExt = exts.find((ext) => newPath.endsWith(ext));
  if (findExt) {
    newPath = newPath.replace(findExt, '');
  }

  return newPath;
}
