"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";

// Extend Window interface for Ethereum provider
declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider & {
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

type ExtendedProvider = ethers.Eip1193Provider & {
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
};

export interface UseWalletState {
  provider: ExtendedProvider | undefined;
  chainId: number | undefined;
  accounts: string[] | undefined;
  isConnected: boolean;
  error: Error | undefined;
  connect: () => void;
  disconnect: () => void;
}

const STORAGE_KEYS = {
  LAST_CONNECTOR_ID: "wallet.lastConnectorId",
  LAST_ACCOUNTS: "wallet.lastAccounts",
  LAST_CHAIN_ID: "wallet.lastChainId",
  CONNECTED: "wallet.connected",
};

export function useWallet(): UseWalletState & { isLoading: boolean } {
  const [provider, setProvider] = useState<ExtendedProvider | undefined>(
    undefined
  );
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [accounts, setAccounts] = useState<string[] | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isConnected =
    provider !== undefined &&
    accounts !== undefined &&
    accounts.length > 0 &&
    chainId !== undefined;

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError(new Error("No wallet provider found"));
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();

      setProvider(window.ethereum);
      setAccounts(accounts);
      setChainId(Number(network.chainId));

      // Persist
      localStorage.setItem(STORAGE_KEYS.LAST_ACCOUNTS, JSON.stringify(accounts));
      localStorage.setItem(STORAGE_KEYS.LAST_CHAIN_ID, String(network.chainId));
      localStorage.setItem(STORAGE_KEYS.CONNECTED, "true");
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Connection failed"));
    }
  }, []);

  const disconnect = useCallback(() => {
    setProvider(undefined);
    setAccounts(undefined);
    setChainId(undefined);
    localStorage.removeItem(STORAGE_KEYS.LAST_ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.LAST_CHAIN_ID);
    localStorage.removeItem(STORAGE_KEYS.CONNECTED);
  }, []);

  // Silent reconnect on mount
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) {
      setIsLoading(false);
      return;
    }

    const lastAccounts = localStorage.getItem(STORAGE_KEYS.LAST_ACCOUNTS);
    const lastChainId = localStorage.getItem(STORAGE_KEYS.LAST_CHAIN_ID);

    if (lastAccounts && lastChainId) {
      // Silent reconnect using eth_accounts
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setProvider(window.ethereum);
            setAccounts(accounts);
            setChainId(Number.parseInt(lastChainId, 10));
          }
          setIsLoading(false);
        })
        .catch(() => {
          // Silent fail
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Listen to events
  useEffect(() => {
    if (!provider || typeof window === "undefined") return;

    const handleAccountsChanged = (newAccounts: string[]) => {
      setAccounts(newAccounts);
      if (newAccounts.length === 0) {
        disconnect();
      } else {
        localStorage.setItem(
          STORAGE_KEYS.LAST_ACCOUNTS,
          JSON.stringify(newAccounts)
        );
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = Number.parseInt(chainIdHex, 16);
      setChainId(newChainId);
      localStorage.setItem(STORAGE_KEYS.LAST_CHAIN_ID, String(newChainId));
    };

    const handleDisconnect = () => {
      disconnect();
    };

    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);
    provider.on?.("disconnect", handleDisconnect);

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
      provider.removeListener?.("disconnect", handleDisconnect);
    };
  }, [provider, disconnect]);

  return {
    provider,
    chainId,
    accounts,
    isConnected,
    error,
    connect,
    disconnect,
    isLoading,
  };
}

