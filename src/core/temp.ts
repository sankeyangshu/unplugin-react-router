import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ensureFile } from '../utils';
import type { NodeItemBackup, RouteBackup } from '../types';

const TEMP_DIR = '.temp';
const GIT_IGNORE = '.gitignore';
const EXCLUDE_GLOB = '.exclude-glob.json';
const NODE_BACKUP = '.node-backup.json';
const ROUTE_BACKUP = '.route-backup.json';

/**
 * get exclude glob file path
 * @descCN 获取 .exclude-glob.json (创建排除规则文件) 文件路径
 * @param root project root path
 * @returns exclude glob path
 */
function getExcludeGlobPath(root: string) {
  return resolve(root, TEMP_DIR, EXCLUDE_GLOB);
}

/**
 * get exclude glob
 * @descCN 获取排除 glob
 * @param root project root path
 * @returns exclude glob
 */
async function getExcludeGlob(root: string) {
  const excludeGlobPath = getExcludeGlobPath(root);

  let excludeGlobs: string[] = [];

  try {
    const content = await readFile(excludeGlobPath, 'utf-8');
    excludeGlobs = JSON.parse(content);
  } catch {
    excludeGlobs = [];
  }

  return excludeGlobs;
}

/**
 * is in exclude glob
 * @descCN 判断是否在排除 glob 中
 * @param root project root path
 * @param glob glob
 */
export async function isInExcludeGlob(root: string, glob: string) {
  const excludeGlobs = await getExcludeGlob(root);
  return excludeGlobs.includes(glob);
}

/**
 * get gitignore path
 * @descCN 获取 .gitignore 文件路径
 * @param root project root path
 * @returns gitignore path
 */
function getGitIgnorePath(cwd: string) {
  return resolve(cwd, GIT_IGNORE);
}

/**
 * init gitignore file
 * @descCN 确保 .gitignore 包含临时目录
 * @param cwd project root path
 */
async function initGitIgnore(cwd: string) {
  const gitIgnorePath = getGitIgnorePath(cwd);

  // 如果 gitignore 文件不存在，则创建一个
  if (!existsSync(gitIgnorePath)) {
    await writeFile(gitIgnorePath, '');
  }

  // 如果 gitignore 文件存在，则读取内容
  const gitIgnoreContent = await readFile(gitIgnorePath, 'utf-8');

  // 如果 gitignore 文件不包含临时目录，则添加
  if (!gitIgnoreContent.includes(TEMP_DIR)) {
    await writeFile(gitIgnorePath, `${gitIgnoreContent}\n${TEMP_DIR}`);
  }
}

/**
 * get node backup file path
 * @descCN 获取 .node-backup.json (节点备份文件) 文件路径
 * @param root project root path
 * @returns node backup path
 */
function getNodeBackupPath(root: string) {
  return resolve(root, TEMP_DIR, NODE_BACKUP);
}

/**
 * init node backup file
 * @descCN 创建 .node-backup.json (节点备份文件)
 * @param root project root path
 */
async function initNodeBackup(root: string) {
  const nodeBackupPath = getNodeBackupPath(root);

  // 如果节点备份文件不存在，则创建一个并写入内容
  if (!existsSync(nodeBackupPath)) {
    await ensureFile(nodeBackupPath);
    await writeFile(nodeBackupPath, '{}');
  }
}

/**
 * get route backup file path
 * @descCN 获取 .route-backup.json (路由备份文件) 文件路径
 * @param root project root path
 * @returns route backup path
 */
function getRouteBackupPath(root: string) {
  return resolve(root, TEMP_DIR, ROUTE_BACKUP);
}

/**
 * init route backup file
 * @descCN 创建 .route-backup.json (路由备份文件)
 * @param root project root path
 */
async function initRouteBackup(root: string) {
  const routeBackupPath = getRouteBackupPath(root);

  // 如果路由备份文件不存在，则创建一个并写入内容
  if (!existsSync(routeBackupPath)) {
    await ensureFile(routeBackupPath);
    await writeFile(routeBackupPath, '{}');
  }
}

/**
 * init exclude glob file
 * @descCN 创建 .exclude-glob.json (创建排除规则文件)
 * @param root project root path
 */
async function initExcludeGlob(root: string) {
  const excludeGlobPath = getExcludeGlobPath(root);

  // 如果排除 glob 文件不存在，则创建一个并写入内容
  if (!existsSync(excludeGlobPath)) {
    await ensureFile(excludeGlobPath);
    await writeFile(excludeGlobPath, '[]');
  }
}

/**
 * init temp files
 * @descCN 初始化所有临时文件
 * @param cwd project root path
 */
export async function initTemp(cwd: string) {
  await initGitIgnore(cwd);
  await initNodeBackup(cwd);
  await initRouteBackup(cwd);
  await initExcludeGlob(cwd);
}

/**
 * get node backup
 * @descCN 获取节点备份
 * @param root project root path
 * @returns node backup
 */
export async function getNodeBackup(root: string) {
  const nodeBackupPath = getNodeBackupPath(root);

  const content = await readFile(nodeBackupPath, 'utf-8');

  let backup: Record<string, NodeItemBackup> = {};

  try {
    backup = JSON.parse(content);
  } catch {
    backup = {};
  }

  return backup;
}

/**
 * get node backup item
 * @descCN 获取节点备份
 * @param cwd project root path
 * @param name node name
 * @returns node backup item
 */
export async function getNodeBackupItem(cwd: string, name: string): Promise<NodeItemBackup | null> {
  const backup = await getNodeBackup(cwd);

  return backup[name] || null;
}

/**
 * get route backup
 * @descCN 获取路由备份
 * @param cwd project root path
 * @returns route backup
 */
async function getRouteBackup(cwd: string) {
  const routeBackupPath = getRouteBackupPath(cwd);

  let backup: RouteBackup = {};

  try {
    const content = await readFile(routeBackupPath, 'utf-8');
    backup = JSON.parse(content);
  } catch {
    backup = {};
  }

  return backup;
}

/**
 * write route backup
 * @descCN 写入路由备份
 * @param cwd project root path
 * @param backup route backup
 */
async function writeRouteBackup(cwd: string, backup: RouteBackup) {
  const routeBackupPath = getRouteBackupPath(cwd);
  const content = JSON.stringify(backup, null, 2);
  await writeFile(routeBackupPath, content);
}

/**
 * update route backup
 * @descCN 更新路由备份
 * @param cwd project root path
 * @param routeBackup route backup
 */
export async function updateRouteBackup(cwd: string, routeBackup: RouteBackup) {
  await initRouteBackup(cwd);

  const backup = await getRouteBackup(cwd);
  Object.assign(backup, routeBackup);

  await writeRouteBackup(cwd, backup);
}
