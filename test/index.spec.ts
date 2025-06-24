import { describe, expect, test } from 'vitest';
import { text } from '../dist/index.js';

describe('should', () => {
  test('exported', () => {
    expect(text).toEqual('hello world');
  });
});
