import {getAllowlistedKeyServers, SealClient, SessionKey} from "@mysten/seal";
import {suiClient} from "./modelSuiService.ts";
import {SUI_CONTRACT} from "../constants/suiConfig.ts";
import {fromHex, toHex} from "@mysten/bcs";
import {Transaction} from "@mysten/sui/transactions";

const sealClient = new SealClient({
    suiClient,
    serverConfigs: getAllowlistedKeyServers('testnet').map((id) => ({
        objectId: id,
        weight: 1,
    })),
    verifyKeyServers: false,
});

interface RangeOption {
    startPosition: number;
    endPosition: number;
}

export const encrypt_range_option = async (
    signerAddress: string,
    startPosition: number,
    endPosition: number,
): Promise<Uint8Array> => {
    const rangeOption: RangeOption = {
        startPosition,
        endPosition,
    }
    const bytes = new TextEncoder().encode(JSON.stringify(rangeOption));

    // key: signerAddress + nonce
    const addressBytes = fromHex(signerAddress);
    const nonce = crypto.getRandomValues(new Uint8Array(5));
    const id = toHex(new Uint8Array([...addressBytes, ...nonce]));

    const { encryptedObject: encryptedBytes } = await sealClient.encrypt({
        threshold: 2,
        packageId: SUI_CONTRACT.PACKAGE_ID,
        id: id,
        data: bytes,
    });

    return encryptedBytes;
}

export const decrypt_range_option = async (
    signerAddress: string,
    allowlistId: string,
    encryptedBytes: Uint8Array,
): Promise<RangeOption> => {
    const sessionKey = new SessionKey({
        address: signerAddress,
        packageId: SUI_CONTRACT.PACKAGE_ID,
        ttlMin: 10, // TTL of 10 minutes
        suiClient,
    });

    const tx = new Transaction();
    tx.moveCall({
        target: `${SUI_CONTRACT.PACKAGE_ID}::allowlist::seal_approve`,
        arguments: [
            tx.pure.vector("u8", fromHex(signerAddress)),
            tx.object(allowlistId),
        ]
    });
    const txBytes = await tx.build( { client: suiClient, onlyTransactionKind: true })
    const decryptedBytes = await sealClient.decrypt({
        data: encryptedBytes,
        sessionKey,
        txBytes,
    });

    const rangeOption: RangeOption = JSON.parse(new TextDecoder().decode(decryptedBytes));

    return rangeOption;
}
