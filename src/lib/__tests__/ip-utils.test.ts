import { describe, it, expect } from '@jest/globals';
import { getClientIp } from '../ip-utils';

// Mock NextRequest para evitar problemas con el entorno de test
const createMockRequest = (headers: Record<string, string>) => {
  const headerMap = new Headers();
  Object.entries(headers).forEach(([key, value]) => {
    headerMap.set(key, value);
  });
  
  return {
    headers: headerMap,
  } as any;
};

describe('IP Utils', () => {
  describe('getClientIp', () => {
    it('should extract IP from cf-connecting-ip header (Cloudflare)', () => {
      const request = createMockRequest({
        'cf-connecting-ip': '192.168.1.100',
      });

      expect(getClientIp(request)).toBe('192.168.1.100');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = createMockRequest({
        'x-real-ip': '10.0.0.1',
      });

      expect(getClientIp(request)).toBe('10.0.0.1');
    });

    it('should extract IP from x-forwarded-for header (first IP)', () => {
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1',
      });

      expect(getClientIp(request)).toBe('192.168.1.1');
    });

    it('should handle x-forwarded-for with spaces', () => {
      const request = createMockRequest({
        'x-forwarded-for': ' 192.168.1.1 , 10.0.0.1 ',
      });

      expect(getClientIp(request)).toBe('192.168.1.1');
    });

    it('should prioritize cf-connecting-ip over x-real-ip', () => {
      const request = createMockRequest({
        'cf-connecting-ip': '192.168.1.100',
        'x-real-ip': '10.0.0.1',
      });

      expect(getClientIp(request)).toBe('192.168.1.100');
    });

    it('should prioritize x-real-ip over x-forwarded-for', () => {
      const request = createMockRequest({
        'x-real-ip': '10.0.0.1',
        'x-forwarded-for': '192.168.1.1',
      });

      expect(getClientIp(request)).toBe('10.0.0.1');
    });

    it('should return "unknown" when no IP headers are present', () => {
      const request = createMockRequest({});
      
      expect(getClientIp(request)).toBe('unknown');
    });

    it('should handle empty x-forwarded-for', () => {
      const request = createMockRequest({
        'x-forwarded-for': '',
      });

      expect(getClientIp(request)).toBe('unknown');
    });
  });
});

