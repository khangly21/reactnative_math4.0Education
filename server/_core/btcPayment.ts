/**
 * Bitcoin Payment Integration using BlockCypher API (Free)
 * BlockCypher provides free Bitcoin testnet and mainnet API
 * No API key required for basic operations
 * 
 * Free tier: 200 requests/hour, 20,000 requests/day
 * Perfect for small to medium applications
 */

import axios from "axios";

const BLOCKCYPHER_API = "https://api.blockcypher.com/v1/btc/main"; // Mainnet
// const BLOCKCYPHER_API = "https://api.blockcypher.com/v1/btc/test3"; // Testnet (for testing)

interface BlockCypherAddress {
  address: string;
  total_received: number;
  total_sent: number;
  balance: number;
  unconfirmed_balance: number;
  final_balance: number;
  n_tx: number;
  unconfirmed_n_tx: number;
  final_n_tx: number;
  txs?: any[];
}

interface BlockCypherTx {
  hash: string;
  addresses: string[];
  total: number;
  fees: number;
  size: number;
  preference: string;
  received: string;
  ver: number;
  lock_time: number;
  vout_sz: number;
  vin_sz: number;
  confirmations: number;
  inputs: any[];
  outputs: any[];
}

/**
 * Check if address has received payment
 * Returns transaction details if payment confirmed
 */
export async function checkAddressPayment(
  address: string
): Promise<BlockCypherAddress | null> {
  try {
    const response = await axios.get(`${BLOCKCYPHER_API}/addrs/${address}/full`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // Address not found or no transactions
    }
    console.error("[BTC Payment] Error checking address:", error.message);
    throw error;
  }
}

/**
 * Get transaction details
 */
export async function getTransaction(txHash: string): Promise<BlockCypherTx | null> {
  try {
    const response = await axios.get(`${BLOCKCYPHER_API}/txs/${txHash}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error("[BTC Payment] Error getting transaction:", error.message);
    throw error;
  }
}

/**
 * Get current BTC price in USD
 */
export async function getBtcPrice(): Promise<number> {
  try {
    // Using CoinGecko API (free, no API key required)
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );
    return response.data.bitcoin.usd;
  } catch (error) {
    console.error("[BTC Payment] Error getting BTC price:", error);
    // Fallback to a reasonable default
    return 40000;
  }
}

/**
 * Convert USD to BTC
 */
export async function convertUsdToBtc(usd: number): Promise<string> {
  const btcPrice = await getBtcPrice();
  const btc = usd / btcPrice;
  return btc.toFixed(8); // Bitcoin uses 8 decimal places
}

/**
 * Convert BTC to USD
 */
export async function convertBtcToUsd(btc: number): Promise<string> {
  const btcPrice = await getBtcPrice();
  const usd = btc * btcPrice;
  return usd.toFixed(2);
}

/**
 * Generate a unique payment address
 * In production, you would use a payment processor like BTCPay, Coinbase Commerce, or similar
 * For this implementation, we'll use a simple approach with address derivation
 */
export function generatePaymentAddress(
  baseAddress: string,
  paymentId: number
): string {
  // This is a simplified approach
  // In production, use HD wallets or a payment processor
  // For now, we'll return the base address
  // The actual payment tracking happens via BlockCypher API
  return baseAddress;
}

/**
 * Verify payment received
 * Checks if the payment address received the expected amount
 */
export async function verifyPayment(
  paymentAddress: string,
  expectedAmountBtc: number,
  minConfirmations: number = 1
): Promise<{
  confirmed: boolean;
  txHash?: string;
  confirmations: number;
  receivedAmount: number;
}> {
  try {
    const addressData = await checkAddressPayment(paymentAddress);

    if (!addressData) {
      return {
        confirmed: false,
        confirmations: 0,
        receivedAmount: 0,
      };
    }

    // Check if received amount matches or exceeds expected amount
    const receivedAmountBtc = addressData.final_balance / 100000000; // Convert satoshis to BTC

    if (receivedAmountBtc >= expectedAmountBtc) {
      // Get the most recent transaction
      if (addressData.txs && addressData.txs.length > 0) {
        const latestTx = addressData.txs[0];
        const isConfirmed = latestTx.confirmations >= minConfirmations;

        return {
          confirmed: isConfirmed,
          txHash: latestTx.hash,
          confirmations: latestTx.confirmations,
          receivedAmount: receivedAmountBtc,
        };
      }
    }

    return {
      confirmed: false,
      confirmations: 0,
      receivedAmount: receivedAmountBtc,
    };
  } catch (error) {
    console.error("[BTC Payment] Error verifying payment:", error);
    throw error;
  }
}

/**
 * Monitor payment address for incoming transactions
 * This would typically be called periodically or via webhooks
 */
export async function monitorPaymentAddress(
  paymentAddress: string,
  expectedAmountBtc: number
): Promise<{
  status: "pending" | "confirmed" | "received";
  txHash?: string;
  confirmations: number;
  receivedAmount: number;
}> {
  try {
    const verification = await verifyPayment(paymentAddress, expectedAmountBtc);

    if (verification.confirmed) {
      return {
        status: "confirmed",
        txHash: verification.txHash,
        confirmations: verification.confirmations,
        receivedAmount: verification.receivedAmount,
      };
    } else if (verification.receivedAmount > 0) {
      return {
        status: "received",
        txHash: verification.txHash,
        confirmations: verification.confirmations,
        receivedAmount: verification.receivedAmount,
      };
    }

    return {
      status: "pending",
      confirmations: 0,
      receivedAmount: 0,
    };
  } catch (error) {
    console.error("[BTC Payment] Error monitoring address:", error);
    throw error;
  }
}

/**
 * Get payment status with human-readable message
 */
export function getPaymentStatusMessage(
  status: "pending" | "confirmed" | "failed" | "expired",
  confirmations?: number
): string {
  switch (status) {
    case "pending":
      return "Waiting for payment...";
    case "confirmed":
      return `Payment confirmed (${confirmations || 0} confirmations)`;
    case "failed":
      return "Payment failed or invalid";
    case "expired":
      return "Payment request expired";
    default:
      return "Unknown status";
  }
}
