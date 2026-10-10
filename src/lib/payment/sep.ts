/**
 * SEP (Saman) payment provider — adapter that wraps the existing saman.ts
 * implementation to conform to the PaymentClient interface.
 */

import {
  isSepConfigured,
  requestToken as sepRequestToken,
  verifyTransaction as sepVerify,
  reverseTransaction as sepReverse,
  tomanToRial,
} from "@/lib/saman";
import type {
  PaymentClient,
  TokenRequest,
  TokenResult,
  VerifyRequest,
  VerifyResult,
  ReverseRequest,
  ReverseResult,
} from "./types";

class SepClient implements PaymentClient {
  readonly provider = "sep" as const;

  isConfigured(): boolean {
    return isSepConfigured();
  }

  async requestToken(params: TokenRequest): Promise<TokenResult> {
    return sepRequestToken(params);
  }

  async verify(params: VerifyRequest): Promise<VerifyResult> {
    return sepVerify({ refNum: params.refNum });
  }

  async reverse(params: ReverseRequest): Promise<ReverseResult> {
    return sepReverse({ refNum: params.refNum });
  }
}

export const sepClient = new SepClient();
export { tomanToRial };
