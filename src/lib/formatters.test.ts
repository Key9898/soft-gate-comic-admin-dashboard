import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercentage,
  truncateText,
} from './formatters';

describe('formatters', () => {
  describe('formatNumber', () => {
    it('formats numbers less than 1000 as is', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(999)).toBe('999');
    });

    it('formats thousands with K suffix', () => {
      expect(formatNumber(1000)).toBe('1.0K');
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(999999)).toBe('1000.0K');
    });

    it('formats millions with M suffix', () => {
      expect(formatNumber(1000000)).toBe('1.0M');
      expect(formatNumber(2500000)).toBe('2.5M');
      expect(formatNumber(10000000)).toBe('10.0M');
    });
  });

  describe('formatCurrency', () => {
    it('formats currency with dollar sign', () => {
      expect(formatCurrency(0)).toBe('$0');
      expect(formatCurrency(100)).toBe('$100');
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(1000000)).toBe('$1,000,000');
    });

    it('formats currency with commas', () => {
      expect(formatCurrency(1234567)).toBe('$1,234,567');
      expect(formatCurrency(999)).toBe('$999');
    });
  });

  describe('formatDate', () => {
    it('formats date string correctly', () => {
      const result = formatDate('2026-04-27');
      expect(result).toContain('Apr');
      expect(result).toContain('27');
      expect(result).toContain('2026');
    });
  });

  describe('formatDateTime', () => {
    it('formats date and time string correctly', () => {
      const result = formatDateTime('2026-04-27T14:30:00');
      expect(result).toContain('Apr');
      expect(result).toContain('27');
      expect(result).toContain('2026');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentage with default decimals', () => {
      expect(formatPercentage(50)).toBe('50.0%');
      expect(formatPercentage(33.333)).toBe('33.3%');
    });

    it('formats percentage with custom decimals', () => {
      expect(formatPercentage(33.333, 2)).toBe('33.33%');
      expect(formatPercentage(100, 0)).toBe('100%');
    });
  });

  describe('truncateText', () => {
    it('returns original text if shorter than max length', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
      expect(truncateText('Hi', 5)).toBe('Hi');
    });

    it('truncates text and adds ellipsis', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...');
      expect(truncateText('This is a long text', 10)).toBe('This is a ...');
    });

    it('returns original text if equal to max length', () => {
      expect(truncateText('Hello', 5)).toBe('Hello');
    });
  });
});
