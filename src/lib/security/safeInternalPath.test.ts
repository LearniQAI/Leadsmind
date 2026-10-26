import { describe, expect, it } from 'vitest';
import { safeInternalPath } from './safeInternalPath';

describe('safeInternalPath', () => {
  it('passes through an ordinary internal path', () => {
    expect(safeInternalPath('/welcome', '/dashboard')).toBe('/welcome');
  });

  it('preserves query and hash on an internal path', () => {
    expect(safeInternalPath('/billing?tier=pro#section', '/dashboard')).toBe('/billing?tier=pro#section');
  });

  it('falls back for a protocol-relative host', () => {
    expect(safeInternalPath('//evil.com', '/dashboard')).toBe('/dashboard');
  });

  it('falls back for an absolute URL to another host', () => {
    expect(safeInternalPath('https://evil.com', '/dashboard')).toBe('/dashboard');
  });

  it('falls back for a javascript: scheme', () => {
    expect(safeInternalPath('javascript:alert(1)', '/dashboard')).toBe('/dashboard');
  });

  it('falls back for a backslash trick browsers treat as protocol-relative', () => {
    expect(safeInternalPath('/\\evil.com', '/dashboard')).toBe('/dashboard');
  });

  it('falls back for percent-encoded host smuggling', () => {
    expect(safeInternalPath('/%2F%2Fevil.com', '/dashboard')).toBe('/dashboard');
  });

  it('falls back for non-string input', () => {
    expect(safeInternalPath(null, '/dashboard')).toBe('/dashboard');
    expect(safeInternalPath(undefined, '/dashboard')).toBe('/dashboard');
  });

  it('falls back for an oversized value', () => {
    expect(safeInternalPath(`/${'a'.repeat(3000)}`, '/dashboard')).toBe('/dashboard');
  });
});
