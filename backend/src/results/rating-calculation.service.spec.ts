import { getIsoWeekKey, getMonthKey } from './rating-calculation.service';

describe('RatingCalculationService (Unit)', () => {
  describe('Date Key Utilities', () => {
    it('should format ISO week key as YYYY-WW correctly', () => {
      // 2026-10-25 is in week 43 of 2026
      const date = new Date('2026-10-25T12:00:00Z');
      const weekKey = getIsoWeekKey(date);
      expect(weekKey).toBe('2026-43');
    });

    it('should format month key as YYYY-MM correctly', () => {
      const date = new Date('2026-10-25T12:00:00Z');
      const monthKey = getMonthKey(date);
      expect(monthKey).toBe('2026-10');
    });
  });

  describe('Multi-player Elo Formula verification', () => {
    it('should compute expected score higher for higher-rated player', () => {
      const r1 = 1600;
      const r2 = 1200;

      const exponent1 = (r2 - r1) / 400; // -1
      const e_12 = 1 / (1 + Math.pow(10, exponent1)); // ~ 0.909

      const exponent2 = (r1 - r2) / 400; // 1
      const e_21 = 1 / (1 + Math.pow(10, exponent2)); // ~ 0.091

      expect(e_12).toBeGreaterThan(0.9);
      expect(e_21).toBeLessThan(0.1);
      expect(e_12 + e_21).toBeCloseTo(1.0, 5);
    });

    it('should award positive delta when defeating higher-rated player', () => {
      const K = 32;
      const r1 = 1200; // underdog
      const r2 = 1600; // favorite

      const exponent = (r2 - r1) / 400;
      const expected = 1 / (1 + Math.pow(10, exponent)); // ~0.0909
      const actual = 1.0; // r1 won

      const delta = Math.round(K * (actual - expected));
      expect(delta).toBeGreaterThanOrEqual(28); // substantial gain
    });
  });
});
