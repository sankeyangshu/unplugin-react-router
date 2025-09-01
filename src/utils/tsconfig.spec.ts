import process from 'node:process';
import { describe, expect, test } from 'vitest';
import { resolveAliasFromTsConfig } from './tsconfig';

describe('test resolveAliasFromTsConfig', () => {
  test('when alias is not defined', () => {
    const alias = resolveAliasFromTsConfig(process.cwd());
    expect(alias).toEqual({});
  });

  test('resolve alias from tsconfig.json', () => {
    const alias = resolveAliasFromTsConfig(process.cwd(), './playground/tsconfig.json');
    expect(alias).toEqual({
      '@': `${process.cwd()}/src`,
      '~root': process.cwd(),
    });
  });
});
