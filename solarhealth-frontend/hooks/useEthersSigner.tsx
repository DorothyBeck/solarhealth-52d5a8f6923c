"use client";

import { ethers } from "ethers";
import { useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "./useWallet";

export function useEthersSigner() {
  const { provider, chainId, accounts } = useWallet();
  
  const [ethersSigner, setEthersSigner] = useState<ethers.JsonRpcSigner | undefined>(undefined);
  const [ethersReadonlyProvider, setEthersReadonlyProvider] = useState<ethers.BrowserProvider | undefined>(undefined);
  
  const sameChainRef = useRef<(chainId: number | undefined) => boolean>(() => true);
  const sameSignerRef = useRef<(signer: ethers.JsonRpcSigner | undefined) => boolean>(() => true);

  useEffect(() => {
    if (!provider || !chainId) {
      setEthersSigner(undefined);
      setEthersReadonlyProvider(undefined);
      return;
    }

    const browserProvider = new ethers.BrowserProvider(provider);
    browserProvider.getSigner().then((signer) => {
      setEthersSigner(signer);
      setEthersReadonlyProvider(browserProvider);
      
      sameChainRef.current = (cid: number | undefined) => cid === chainId;
      sameSignerRef.current = (s: ethers.JsonRpcSigner | undefined) => s === signer;
    }).catch((err) => {
      console.error("Failed to get signer:", err);
    });
  }, [provider, chainId]);

  return {
    ethersSigner,
    ethersReadonlyProvider,
    sameChain: sameChainRef,
    sameSigner: sameSignerRef,
  };
}


