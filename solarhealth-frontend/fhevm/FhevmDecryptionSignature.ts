import { ethers } from "ethers";
import {
  EIP712Type,
  FhevmDecryptionSignatureType,
  FhevmInstance,
} from "./fhevmTypes";
import { GenericStringStorage } from "./GenericStringStorage";

function _timestampNow(): number {
  return Math.floor(Date.now() / 1000);
}

class FhevmDecryptionSignatureStorageKey {
  #contractAddresses: `0x${string}`[];
  #userAddress: `0x${string}`;
  #publicKey: string | undefined;
  #key: string;

  constructor(
    instance: FhevmInstance,
    contractAddresses: string[],
    userAddress: string,
    publicKey?: string
  ) {
    if (!ethers.isAddress(userAddress)) {
      throw new TypeError(`Invalid address ${userAddress}`);
    }

    const sortedContractAddresses = (
      contractAddresses as `0x${string}`[]
    ).sort();

    const emptyEIP712 = instance.createEIP712(
      publicKey ?? ethers.ZeroAddress,
      sortedContractAddresses,
      0,
      0
    );

    try {
      const hash = ethers.TypedDataEncoder.hash(
        emptyEIP712.domain,
        { UserDecryptRequestVerification: emptyEIP712.types.UserDecryptRequestVerification },
        emptyEIP712.message
      );

      this.#contractAddresses = sortedContractAddresses;
      this.#userAddress = userAddress as `0x${string}`;

      this.#key = `${userAddress}:${hash}`;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  get contractAddresses(): `0x${string}`[] {
    return this.#contractAddresses;
  }

  get userAddress(): `0x${string}` {
    return this.#userAddress;
  }

  get publicKey(): string | undefined {
    return this.#publicKey;
  }

  get key(): string {
    return this.#key;
  }
}

export class FhevmDecryptionSignature {
  #publicKey: string;
  #privateKey: string;
  #signature: string;
  #startTimestamp: number;
  #durationDays: number;
  #userAddress: `0x${string}`;
  #contractAddresses: `0x${string}`[];
  #eip712: EIP712Type;

  private constructor(parameters: FhevmDecryptionSignatureType) {
    if (!FhevmDecryptionSignature.checkIs(parameters)) {
      throw new TypeError("Invalid FhevmDecryptionSignatureType");
    }
    this.#publicKey = parameters.publicKey;
    this.#privateKey = parameters.privateKey;
    this.#signature = parameters.signature;
    this.#startTimestamp = parameters.startTimestamp;
    this.#durationDays = parameters.durationDays;
    this.#userAddress = parameters.userAddress;
    this.#contractAddresses = parameters.contractAddresses;
    this.#eip712 = parameters.eip712;
  }

  public get privateKey() {
    return this.#privateKey;
  }

  public get publicKey() {
    return this.#publicKey;
  }

  public get signature() {
    return this.#signature;
  }

  public get startTimestamp() {
    return this.#startTimestamp;
  }

  public get durationDays() {
    return this.#durationDays;
  }

  public get userAddress() {
    return this.#userAddress;
  }

  public get contractAddresses() {
    return this.#contractAddresses;
  }

  public get eip712() {
    return this.#eip712;
  }

  static checkIs(value: unknown): value is FhevmDecryptionSignatureType {
    if (typeof value !== "object" || value === null) {
      return false;
    }
    const v = value as Record<string, unknown>;
    return (
      typeof v.publicKey === "string" &&
      typeof v.privateKey === "string" &&
      typeof v.signature === "string" &&
      typeof v.startTimestamp === "number" &&
      typeof v.durationDays === "number" &&
      typeof v.userAddress === "string" &&
      Array.isArray(v.contractAddresses) &&
      typeof v.eip712 === "object"
    );
  }

  static async loadOrSign(
    instance: FhevmInstance,
    contractAddresses: `0x${string}`[],
    signer: ethers.JsonRpcSigner,
    storage: GenericStringStorage,
    keyPair?: { publicKey: string; privateKey: string }
  ): Promise<FhevmDecryptionSignature | null> {
    const userAddress = (await signer.getAddress()) as `0x${string}`;

    const cached = await FhevmDecryptionSignature.loadFromGenericStringStorage(
      storage,
      instance,
      contractAddresses,
      userAddress,
      keyPair?.publicKey
    );

    if (cached) {
      return cached;
    }

    const { publicKey, privateKey } = keyPair ?? instance.generateKeypair();

    const sig = await FhevmDecryptionSignature.new(
      instance,
      contractAddresses,
      publicKey,
      privateKey,
      signer
    );

    if (!sig) {
      return null;
    }

    await sig.saveToGenericStringStorage(
      storage,
      instance,
      Boolean(keyPair?.publicKey)
    );

    return sig;
  }

  toJSON(): FhevmDecryptionSignatureType {
    return {
      publicKey: this.#publicKey,
      privateKey: this.#privateKey,
      signature: this.#signature,
      startTimestamp: this.#startTimestamp,
      durationDays: this.#durationDays,
      userAddress: this.#userAddress,
      contractAddresses: this.#contractAddresses,
      eip712: this.#eip712,
    };
  }

  static fromJSON(json: unknown): FhevmDecryptionSignature {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    return new FhevmDecryptionSignature(data);
  }

  isValid(): boolean {
    return (
      _timestampNow() < this.#startTimestamp + this.#durationDays * 24 * 60 * 60
    );
  }

  static async loadFromGenericStringStorage(
    storage: GenericStringStorage,
    instance: FhevmInstance,
    contractAddresses: string[],
    userAddress: string,
    publicKey?: string
  ): Promise<FhevmDecryptionSignature | null> {
    try {
      const storageKey = new FhevmDecryptionSignatureStorageKey(
        instance,
        contractAddresses,
        userAddress,
        publicKey
      );

      const result = storage.getItem 
        ? await Promise.resolve(storage.getItem(storageKey.key))
        : storage.get?.(storageKey.key);

      if (!result) {
        return null;
      }

      try {
        const kps = FhevmDecryptionSignature.fromJSON(result);
        if (!kps.isValid()) {
          return null;
        }
        return kps;
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  }

  async saveToGenericStringStorage(
    storage: GenericStringStorage,
    instance: FhevmInstance,
    withPublicKey: boolean
  ): Promise<void> {
    try {
      const value = JSON.stringify(this.toJSON());

      const storageKey = new FhevmDecryptionSignatureStorageKey(
        instance,
        this.#contractAddresses,
        this.#userAddress,
        withPublicKey ? this.#publicKey : undefined
      );
      if (storage.setItem) {
        await Promise.resolve(storage.setItem(storageKey.key, value));
      } else if (storage.set) {
        storage.set(storageKey.key, value);
      }
    } catch {
      console.error(
        `FhevmDecryptionSignature.saveToGenericStringStorage() failed!`
      );
    }
  }

  static async new(
    instance: FhevmInstance,
    contractAddresses: string[],
    publicKey: string,
    privateKey: string,
    signer: ethers.JsonRpcSigner
  ): Promise<FhevmDecryptionSignature | null> {
    try {
      const userAddress = (await signer.getAddress()) as `0x${string}`;
      const startTimestamp = _timestampNow();
      const durationDays = 365;
      const eip712 = instance.createEIP712(
        publicKey,
        contractAddresses,
        startTimestamp,
        durationDays
      );
      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );
      return new FhevmDecryptionSignature({
        publicKey,
        privateKey,
        contractAddresses: contractAddresses as `0x${string}`[],
        startTimestamp,
        durationDays,
        signature,
        eip712: eip712 as EIP712Type,
        userAddress,
      });
    } catch {
      return null;
    }
  }
}

