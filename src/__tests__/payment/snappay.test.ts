/**
 * SnappPay client unit tests.
 *
 * These tests mock the HTTP layer and verify that the client correctly:
 * - Obtains and caches OAuth tokens
 * - Requests payment tokens
 * - Verifies and settles payments
 * - Handles errors and retries
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { snappayClient, _clearCacheForTests } from "@/lib/payment/snappay";

// Mock db.ts to avoid file I/O during tests
vi.mock("@/lib/db", () => ({
  getSetting: vi.fn(() => undefined),
}));

describe("SnappPay Client", () => {
  const mockFetch = global.fetch as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    _clearCacheForTests();
    // Set required env vars
    process.env.SNAPPAY_BASE_URL = "https://api.snapppay.test";
    process.env.SNAPPAY_CLIENT_ID = "test-client-id";
    process.env.SNAPPAY_CLIENT_SECRET = "test-client-secret";
    process.env.SNAPPAY_USERNAME = "test-username";
    process.env.SNAPPAY_PASSWORD = "test-password";
  });

  afterEach(() => {
    delete process.env.SNAPPAY_BASE_URL;
    delete process.env.SNAPPAY_CLIENT_ID;
    delete process.env.SNAPPAY_CLIENT_SECRET;
    delete process.env.SNAPPAY_USERNAME;
    delete process.env.SNAPPAY_PASSWORD;
  });

  describe("isConfigured", () => {
    it("returns true when all env vars are set", () => {
      expect(snappayClient.isConfigured()).toBe(true);
    });

    it("returns false when client ID is missing", () => {
      delete process.env.SNAPPAY_CLIENT_ID;
      expect(snappayClient.isConfigured()).toBe(false);
    });

    it("returns false when client secret is missing", () => {
      delete process.env.SNAPPAY_CLIENT_SECRET;
      expect(snappayClient.isConfigured()).toBe(false);
    });
  });

  describe("requestToken", () => {
    it("obtains OAuth token and returns payment URL", async () => {
      // Mock OAuth token response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "mock-access-token",
          expires_in: 3600,
          token_type: "bearer",
        }),
      } as Response);

      // Mock eligible check response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          successful: true,
          response: { eligible: true },
        }),
      } as Response);

      // Mock payment token response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          successful: true,
          response: {
            paymentToken: "spp_test_token",
            paymentPageUrl: "https://pay.snapppay.test/checkout?token=spp_test_token",
          },
        }),
      } as Response);

      const result = await snappayClient.requestToken({
        amountRial: 1_000_000,
        orderId: "test-order-123",
        callbackUrl: "https://example.com/callback",
        cellNumber: "+989123456789",
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.token).toBe("spp_test_token");
        expect(result.paymentUrl).toContain("checkout");
      }

      // Verify OAuth call
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/online/v1/oauth/token"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Basic"),
          }),
        }),
      );

      // Verify eligible check call
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/online/offer/v1/eligible"),
        expect.anything(),
      );

      // Verify payment token call
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/online/payment/v1/token"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-access-token",
          }),
        }),
      );
    });

    it("returns error when not eligible", async () => {
      // Mock OAuth token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "mock-token",
          expires_in: 3600,
        }),
      } as Response);

      // Mock eligible check returning false
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          successful: true,
          response: { eligible: false },
        }),
      } as Response);

      const result = await snappayClient.requestToken({
        amountRial: 500, // too low
        orderId: "test-order-456",
        callbackUrl: "https://example.com/callback",
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe("NOT_ELIGIBLE");
      }
    });

    it("caches OAuth token for subsequent requests", async () => {
      // Mock OAuth token once
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "cached-token",
          expires_in: 3600,
        }),
      } as Response);

      // First request: eligible + payment token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          successful: true,
          response: { eligible: true },
        }),
      } as Response);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          successful: true,
          response: {
            paymentToken: "token1",
            paymentPageUrl: "https://pay.test/1",
          },
        }),
      } as Response);

      // Second request: eligible + payment token (reusing cached OAuth token)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          successful: true,
          response: { eligible: true },
        }),
      } as Response);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          successful: true,
          response: {
            paymentToken: "token2",
            paymentPageUrl: "https://pay.test/2",
          },
        }),
      } as Response);

      // First request
      await snappayClient.requestToken({
        amountRial: 1_000_000,
        orderId: "order1",
        callbackUrl: "https://example.com/cb",
      });

      // Second request should reuse cached token
      await snappayClient.requestToken({
        amountRial: 2_000_000,
        orderId: "order2",
        callbackUrl: "https://example.com/cb",
      });

      // OAuth endpoint should only be called once
      const oauthCalls = mockFetch.mock.calls.filter((call) =>
        String(call[0]).includes("/oauth/token"),
      );
      expect(oauthCalls).toHaveLength(1);
    });
  });

  describe("verify", () => {
    it("verifies and settles a payment", async () => {
      // Mock OAuth token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "verify-token",
          expires_in: 3600,
        }),
      } as Response);

      // Mock verify response with amount field
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          successful: true,
          response: {
            transactionId: "txn-123",
            amount: 1_500_000,
          },
        }),
      } as Response);

      // Mock settle response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          successful: true,
        }),
      } as Response);

      const result = await snappayClient.verify({
        refNum: "spp_payment_token_abc",
        providerToken: "spp_payment_token_abc",
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.amountRial).toBe(1_500_000);
        expect(result.refNum).toBe("spp_payment_token_abc");
      }

      // Verify both verify and settle were called
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/online/payment/v1/verify"),
        expect.anything(),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/online/payment/v1/settle"),
        expect.anything(),
      );
    });

    it("returns error when settle fails after verify succeeds", async () => {
      // Mock OAuth
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "t", expires_in: 3600 }),
      } as Response);

      // Mock verify success
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          successful: true,
          response: { transactionId: "txn-456", amount: 1_000_000 },
        }),
      } as Response);

      // Mock settle failure
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          successful: false,
          errorCode: "SETTLE_ERROR",
          message: "Settle failed",
        }),
      } as Response);

      const result = await snappayClient.verify({
        refNum: "spp_token_fail",
        providerToken: "spp_token_fail",
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe("SETTLE_ERROR");
        expect(result.message).toContain("Settle failed");
      }
    });
  });

  describe("reverse", () => {
    it("reverts a payment before settle", async () => {
      // Mock OAuth
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "rev-token", expires_in: 3600 }),
      } as Response);

      // Mock revert response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          successful: true,
        }),
      } as Response);

      const result = await snappayClient.reverse({
        refNum: "spp_revert_token",
        providerToken: "spp_revert_token",
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.refNum).toBe("spp_revert_token");
      }

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/online/payment/v1/revert"),
        expect.anything(),
      );
    });
  });

  describe("error handling", () => {
    it("handles network errors gracefully", async () => {
      // Network error on eligible check after OAuth succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "t", expires_in: 3600 }),
      } as Response);

      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      const result = await snappayClient.requestToken({
        amountRial: 1_000_000,
        orderId: "net-error",
        callbackUrl: "https://example.com/cb",
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe("NETWORK");
      }
    });

    it("returns error when not configured", async () => {
      delete process.env.SNAPPAY_CLIENT_ID;

      const result = await snappayClient.requestToken({
        amountRial: 1_000_000,
        orderId: "no-config",
        callbackUrl: "https://example.com/cb",
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe("NOT_CONFIGURED");
      }
    });
  });
});
