/**
 * Vitest setup — runs before all tests.
 * Mock global fetch and set up test env vars.
 */

import { vi } from "vitest";

// Mock fetch globally
global.fetch = vi.fn();

// Set minimal env vars for tests
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = "test-secret-key-for-hmac-signing-only";
}
