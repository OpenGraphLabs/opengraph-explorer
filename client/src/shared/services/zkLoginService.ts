import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import {
  generateNonce,
  generateRandomness,
  jwtToAddress,
  getExtendedEphemeralPublicKey,
} from "@mysten/sui/zklogin";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export interface JwtPayload {
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  iat: number;
  nonce?: string;
}

export interface ZkLoginInitResponse {
  nonce: string;
  oauth_url: string;
}

export interface ZkProofRequest {
  jwt_token: string;
  ephemeral_public_key: string;
  max_epoch: number;
}

export interface ZkProofResponse {
  sui_address: string;
  user_salt: string;
  zk_proof: any;
  success: boolean;
}

export interface ZkLoginResult {
  sui_address: string;
  zk_proof: any;
  success: boolean;
}

export interface UpdateSuiAddressRequest {
  sui_address: string;
}

export interface UpdateSuiAddressResponse {
  success: boolean;
  sui_address: string;
}

export class ZkLoginService {
  private ephemeralKeyPair: Ed25519Keypair | null = null;
  private maxEpoch: number = 0;
  private randomness: string = "";
  private serverUrl: string = import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:8000";

  /**
   * Initialize or retrieve ephemeral key pair from session storage
   */
  async initializeEphemeralKeyPair(): Promise<Ed25519Keypair> {
    const storedKeyData = sessionStorage.getItem("zklogin-ephemeral-key-data");
    const storedRandomness = sessionStorage.getItem("zklogin-randomness");
    const storedMaxEpoch = sessionStorage.getItem("zklogin-max-epoch");

    if (storedKeyData && storedRandomness && storedMaxEpoch) {
      try {
        // Restore from session storage using the serialized key data
        const keyData = JSON.parse(storedKeyData);
        this.ephemeralKeyPair = Ed25519Keypair.fromSecretKey(Uint8Array.from(keyData.secretKey));
        this.randomness = storedRandomness;
        this.maxEpoch = parseInt(storedMaxEpoch, 10);
      } catch (error) {
        console.error("Failed to restore key pair from session storage:", error);
        // Clear corrupted data and generate new
        sessionStorage.removeItem("zklogin-ephemeral-key-data");
        sessionStorage.removeItem("zklogin-randomness");
        sessionStorage.removeItem("zklogin-max-epoch");
        return this.initializeEphemeralKeyPair();
      }
    } else {
      // Generate new key pair
      this.ephemeralKeyPair = new Ed25519Keypair();
      this.randomness = generateRandomness(); // randomness in Base64 format

      // Set max epoch before storing
      await this.fetchMaxEpoch();

      // Store in session storage with proper key format
      const secretKey = this.ephemeralKeyPair.getSecretKey();
      // Ed25519 secret key should be 32 bytes, but getSecretKey() returns 64 bytes (32 secret + 32 public)
      // We need only the first 32 bytes for the secret key
      const actualSecretKey = secretKey.slice(0, 32);

      sessionStorage.setItem(
        "zklogin-ephemeral-key-data",
        JSON.stringify({
          secretKey: Array.from(actualSecretKey),
        })
      );
      sessionStorage.setItem("zklogin-randomness", this.randomness);
      sessionStorage.setItem("zklogin-max-epoch", this.maxEpoch.toString());
    }

    return this.ephemeralKeyPair;
  }

  /**
   * Get the current ephemeral key pair
   */
  getEphemeralKeyPair(): Ed25519Keypair {
    if (!this.ephemeralKeyPair) {
      throw new Error("Ephemeral key pair not initialized");
    }
    return this.ephemeralKeyPair;
  }

  /**
   * Generate nonce from ephemeral public key
   */
  generateNonce(): string {
    if (!this.ephemeralKeyPair) {
      throw new Error("Ephemeral key pair not initialized");
    }

    const publicKey = this.ephemeralKeyPair.getPublicKey();

    const nonce = generateNonce(publicKey, this.maxEpoch, this.randomness);

    return nonce;
  }

  /**
   * Initialize zkLogin with server and get OAuth URL
   */
  async initializeWithServer(nonce: string): Promise<string> {
    if (!this.ephemeralKeyPair) {
      throw new Error("Ephemeral key pair not initialized");
    }

    try {
      const response = await axios.post<ZkLoginInitResponse>(
        `${this.serverUrl}/api/v1/auth/zklogin/init`,
        {
          nonce: nonce,
        }
      );

      return response.data.oauth_url;
    } catch (error) {
      console.error("Failed to initialize zkLogin with server:", error);
      throw new Error("Failed to initialize zkLogin with server");
    }
  }

  /**
   * Fetch current max epoch from Sui network
   */
  private async fetchMaxEpoch(): Promise<void> {
    try {
      // Import SuiClient dynamically to avoid issues
      const { SuiClient } = await import("@mysten/sui/client");

      const client = new SuiClient({
        url: import.meta.env.VITE_SUI_RPC_URL || "https://fullnode.devnet.sui.io:443",
      });

      const systemState = await client.getLatestSuiSystemState();
      // Set max epoch to current epoch + 2 for sufficient validity period
      this.maxEpoch = Number(systemState.epoch) + 2;
    } catch (error) {
      console.error("Failed to fetch max epoch:", error);
      // Use a reasonable fallback based on current testnet epoch
      this.maxEpoch = 1000; // Safe fallback
    }
  }

  /**
   * Generate ZK proof using server API (deprecated - use completeZkLoginFlow)
   */
  async generateZkProof(jwtToken: string): Promise<ZkProofResponse> {
    if (!this.ephemeralKeyPair) {
      throw new Error("Ephemeral key pair not initialized");
    }

    try {
      const publicKey = this.ephemeralKeyPair.getPublicKey().toBase64();

      const response = await axios.post<ZkProofResponse>(
        `${this.serverUrl}/api/v1/auth/zklogin/prove`,
        {
          jwt_token: jwtToken,
          ephemeral_public_key: publicKey,
          max_epoch: this.maxEpoch,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Failed to generate ZK proof:", error);
      throw new Error("Failed to generate ZK proof");
    }
  }

  /**
   * Generate Sui address from JWT and salt using official Sui SDK
   */
  generateSuiAddress(jwtToken: string, salt: string): string {
    try {
      // Convert base64 salt to BigInt for jwtToAddress
      const saltBytes = atob(salt);
      let saltBigInt = 0n;
      for (let i = 0; i < saltBytes.length; i++) {
        saltBigInt = (saltBigInt << 8n) + BigInt(saltBytes.charCodeAt(i));
      }

      // Use official Sui SDK function for address generation
      const zkLoginUserAddress = jwtToAddress(jwtToken, saltBigInt);

      return zkLoginUserAddress;
    } catch (error) {
      throw new Error("Failed to generate Sui address");
    }
  }

  /**
   * Generate ZK proof using Mysten Labs proving service
   */
  async generateZkProofClient(jwtToken: string, salt: string): Promise<any> {
    if (!this.ephemeralKeyPair) {
      throw new Error("Ephemeral key pair not initialized");
    }

    try {
      // Generate extended ephemeral public key
      const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(
        this.ephemeralKeyPair.getPublicKey()
      );

      // Call Mysten Labs proving service
      const proverUrl = "https://prover-dev.mystenlabs.com/v1";

      const payload = {
        jwt: jwtToken,
        extendedEphemeralPublicKey: extendedEphemeralPublicKey, // Base64
        maxEpoch: this.maxEpoch,
        jwtRandomness: this.randomness, // BigInt
        salt: salt, // Base64 (already 16 bytes from server)
        keyClaimName: "sub",
      };

      const response = await axios.post(proverUrl, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      });

      return response.data;
    } catch (error) {
      throw new Error("Failed to generate ZK proof");
    }
  }

  /**
   * Update Sui address on server
   */
  async updateSuiAddressOnServer(suiAddress: string): Promise<UpdateSuiAddressResponse> {
    try {
      const accessToken = sessionStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("No access token found");
      }

      const response = await axios.post<UpdateSuiAddressResponse>(
        `${this.serverUrl}/api/v1/auth/sui-address`,
        { sui_address: suiAddress },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Failed to update Sui address on server:", error);
      throw new Error("Failed to update Sui address on server");
    }
  }

  /**
   * Complete zkLogin flow on client side using official Sui SDK
   */
  async completeZkLoginFlow(jwtToken: string, salt: string): Promise<ZkLoginResult> {
    try {
      // Try to restore ephemeral key pair from session storage first
      if (!this.ephemeralKeyPair) {
        try {
          // First try to restore from session storage
          const storedKeyData = sessionStorage.getItem("zklogin-ephemeral-key-data");
          const storedRandomness = sessionStorage.getItem("zklogin-randomness");

          if (storedKeyData && storedRandomness) {
            // Restore from session storage
            const keyData = JSON.parse(storedKeyData);
            this.ephemeralKeyPair = Ed25519Keypair.fromSecretKey(
              Uint8Array.from(keyData.secretKey)
            );
            this.randomness = storedRandomness;

            // Also restore maxEpoch from session storage if available
            const storedMaxEpoch = sessionStorage.getItem("zklogin-max-epoch");
            if (storedMaxEpoch) {
              this.maxEpoch = parseInt(storedMaxEpoch, 10);
            } else {
              // Only fetch if not stored
              await this.fetchMaxEpoch();
              sessionStorage.setItem("zklogin-max-epoch", this.maxEpoch.toString());
            }
          } else {
            throw new Error("No ephemeral key available in session storage or parameter");
          }
        } catch (error) {
          await this.initializeEphemeralKeyPair();
        }
      }

      // 1. Generate Sui address using official SDK
      const suiAddress = this.generateSuiAddress(jwtToken, salt);

      // 2. Generate ZK proof using official SDK
      const zkProof = await this.generateZkProofClient(jwtToken, salt);

      // 3. Update Sui address on server
      await this.updateSuiAddressOnServer(suiAddress);

      return {
        sui_address: suiAddress,
        zk_proof: zkProof,
        success: true,
      };
    } catch (error) {
      console.error("zkLogin flow failed:", error);
      throw error;
    }
  }

  /**
   * Clear ephemeral key pair from session
   */
  clearSession(): void {
    // Remove both old and new format keys
    sessionStorage.removeItem("zklogin-ephemeral-key"); // old format
    sessionStorage.removeItem("zklogin-ephemeral-key-data"); // new format
    sessionStorage.removeItem("zklogin-randomness");
    sessionStorage.removeItem("zklogin-max-epoch");
    this.ephemeralKeyPair = null;
    this.randomness = "";
    this.maxEpoch = 0;
  }

  /**
   * Decode and validate JWT
   */
  decodeJwt(jwt: string): JwtPayload {
    try {
      return jwtDecode<JwtPayload>(jwt);
    } catch (error) {
      throw new Error("Invalid JWT token");
    }
  }
}

// Export singleton instance
export const zkLoginService = new ZkLoginService();
