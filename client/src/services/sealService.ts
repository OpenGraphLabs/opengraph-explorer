import {getAllowlistedKeyServers, SealClient, SessionKey} from "@mysten/seal";
import {suiClient} from "./modelSuiService.ts";
import {SUI_CONTRACT} from "../constants/suiConfig.ts";
import {fromHex, toHex} from "@mysten/bcs";
import {Transaction} from "@mysten/sui/transactions";
import { useSignPersonalMessage } from "@mysten/dapp-kit";

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

export const encryptRangeOption = async (
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

export function useSealService() {
    const { mutate: signPersonalMessage } = useSignPersonalMessage();

    const decryptRangeOption = async (
        signerAddress: string,
        allowlistId: string,
        encryptedBytes: Uint8Array,
    ): Promise<RangeOption> => {
        console.log("encryptedBytes: ", encryptedBytes);

        const sessionKey = new SessionKey({
            address: signerAddress,
            packageId: SUI_CONTRACT.PACKAGE_ID,
            ttlMin: 10, // TTL of 10 minutes
            suiClient,
        });
        // const message = sessionKey.getPersonalMessage();
        // const { signature } = await signPersonalMessage(message); // User confirms in wallet
        // console.log("signature: ", signature);
        // await sessionKey.setPersonalMessageSignature(signature); // Initialization complete
        // console.log("xxxxxxxxxxxxxxxx")

        try {
            signPersonalMessage(
                {
                    message: sessionKey.getPersonalMessage(),
                },
                {
                    onSuccess: async (result: { signature: string }) => {
                        await sessionKey.setPersonalMessageSignature(result.signature);
                        // set('sessionKey', sessionKey.export());

                        const tx = new Transaction();
                        tx.moveCall({
                            target: `${SUI_CONTRACT.PACKAGE_ID}::allowlist::seal_approve`,
                            arguments: [
                                tx.pure.vector("u8", fromHex(signerAddress)),
                                tx.object(allowlistId),
                            ]
                        });
                        console.log("xxxxxxxxxxxxxxxx")
                        const txBytes = await tx.build( { client: suiClient, onlyTransactionKind: true })
                        const decryptedBytes = await sealClient.decrypt({
                            data: encryptedBytes,
                            sessionKey,
                            txBytes,
                        });

                        console.log("decryptedBytes: ", decryptedBytes);
                        const rangeOption: RangeOption = JSON.parse(new TextDecoder().decode(decryptedBytes));

                        console.log("rangeOption: ", rangeOption);

                        return rangeOption;
                    },
                },
            );
        }   catch (error: any) {
            console.error("Error decrypting range option:", error);
        }
    }

    return {
        decryptRangeOption,
    };
}
