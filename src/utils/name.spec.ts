import { describe, expect, test } from 'vitest';
import { getImportName, transformPathToName } from './name';

describe('test getImportName', () => {
  test('when name is a number', () => {
    const name = getImportName('123');
    expect(name).toBe('_123');
  });

  test('when name is a string', () => {
    const name = getImportName('test');
    expect(name).toBe('Test');
  });

  test('when name is a string with kebab-case', () => {
    const name = getImportName('user-info');
    expect(name).toBe('UserInfo');
  });

  test('when name is a string with snake_case', () => {
    const name = getImportName('test_123');
    expect(name).toBe('Test123');
  });

  test('when name is a string with camelCase', () => {
    const name = getImportName('test123');
    expect(name).toBe('Test123');
  });
});

describe('test transformPathToName', () => {
  test('when path is /user/profile', () => {
    const name = transformPathToName('/user/profile');
    expect(name).toBe('UserProfile');
  });

  test('when path is /blog/:id', () => {
    const name = transformPathToName('/blog/:id');
    expect(name).toBe('BlogId');
  });

  test('when path is /search?query', () => {
    const name = transformPathToName('/search?query');
    expect(name).toBe('Searchquery');
  });
});
