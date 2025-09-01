import { describe, expect, test } from 'vitest';
import { resolveImportPath } from './path';

describe('test resolveImportPath', () => {
  test('alias replace', () => {
    const path = resolveImportPath('src/components/Button', {
      '@': 'src',
    });
    expect(path).toBe('@/components/Button');
  });

  test('multiple alias replace', () => {
    const path = resolveImportPath('./components/Button', {
      '@': 'src',
      '~root': '.',
    });
    expect(path).toBe('~root/components/Button');
  });

  test('multi-level alias replace', () => {
    const path = resolveImportPath('src/components/Button.tsx', {
      '@': 'src',
      '~components': 'src/components',
    });
    expect(path).toBe('@/components/Button');
  });

  test('delete tsx extension', () => {
    const path = resolveImportPath('src/components/Button.tsx', {
      '@': 'src',
    });
    expect(path).toBe('@/components/Button');
  });

  test('delete jsx extension', () => {
    const path = resolveImportPath('src/components/Button.jsx', {
      '@': 'src',
    });
    expect(path).toBe('@/components/Button');
  });

  test('not replace alias when path is not start with alias', () => {
    const path = resolveImportPath('components/Button.tsx', {
      '@': 'src',
    });
    expect(path).toBe('components/Button');
  });
});
