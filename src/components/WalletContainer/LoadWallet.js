import {clusterApiUrl, Connection, PublicKey} from "@solana/web3.js";
import {deserializeUnchecked} from "borsh";
import {Metadata, METADATA_SCHEMA} from "./Metadata";
import {firestore} from "./LoadFloorData";
import {serverTimestamp} from "@firebase/firestore";

const SEED = "metadata"
const METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
const SOLANA_TOKEN_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")

export async function loadWallet(walletAddress, totalCountCallback, currentCountCallback) {
    const connection = new Connection("https://dark-summer-dew.solana-mainnet.quiknode.pro/431dccc44f65b6985822f912053640645ae71683/")

    var walletPK = ""

    try {
        walletPK = toPublicKey(walletAddress)
    } catch {
        alert("Couldn't find wallet at that address. Please enter a valid wallet address.")
        return null;
    }

    // Array of all token accounts in user's wallet
    const tokens = (await connection.getParsedTokenAccountsByOwner(walletPK, {programId: SOLANA_TOKEN_ID})).value

    // Filter tokens by decimal and value
    const nonFungibleTokens = tokens.filter(token => token.account.data.parsed.info.tokenAmount.amount === "1" && token.account.data.parsed.info.tokenAmount.decimals === 0)
    totalCountCallback(nonFungibleTokens.length)

    let uploadToFirebase = {}
    let nftMetadata = []
    let count = 0

    // Check to see if this is the first time seeing this wallet
    var doc = await firestore.doc('wallets/'+walletAddress).get()
    let seenWallet = true;
    if (!doc.exists) {
        // If this is the first time seeing this wallet, we want to load every NFT from the API and save this wallet address to Firebase
        await firestore.doc('wallets/'+walletAddress).set({'lastAccessed': serverTimestamp()})
        seenWallet = false;
    }

    for (let token of nonFungibleTokens) {
        try {
            count++;
            currentCountCallback(count);
            const mintAddress = toPublicKey(token.account.data.parsed.info.mint)

            // If we're supposed to check Firebase (only on seen wallets), attempt to load metadata
            let metadataInFirebase = false;
            if (seenWallet) {
                if (doc.data()[mintAddress.toString()]) {
                    metadataInFirebase = true;
                }
            }

            // If we're not supposed to check Firebase OR the document from firebase doesn't exist, ping the API
            if (!seenWallet || !metadataInFirebase) {
                const seeds = [Buffer.from(SEED), toPublicKey(METADATA_PROGRAM_ID).toBuffer(), (mintAddress).toBuffer()]
                const pdaAccount = await findProgramAddress(seeds, toPublicKey(METADATA_PROGRAM_ID))
                const pdaAccountInfo = (await connection.getParsedAccountInfo(pdaAccount))
                const pdaAccountData = pdaAccountInfo.value.data

                const metadata = new Metadata(deserializeUnchecked(
                    METADATA_SCHEMA,
                    Metadata,
                    pdaAccountData,
                ));

                // Add URI JSON to metadata
                metadata["uriJSON"] = await getJSONFromURI(metadata.data.uri)

                // Update Firebase with this NFT + metadata
                uploadToFirebase[mintAddress.toString()] = JSON.stringify(metadata)
                // firestore.doc('metadata/'+mintAddress.toString()).set({"metadata":JSON.stringify(metadata)})

                // Push metadata
                nftMetadata.push(metadata)
            } else {
                // Push metadata
                nftMetadata.push(JSON.parse(doc.data()[mintAddress.toString()]));
            }

        } catch (e) {
            console.log(e)
        }
    }

    if (Object.keys(uploadToFirebase).length > 0) {
        firestore.doc('wallets/'+walletAddress).update(uploadToFirebase)
    }

    return nftMetadata.sort((a, b) => (a.updateAuthority).localeCompare(b.updateAuthority))
}

async function getJSONFromURI(uri) {
    return fetch(uri).then(res => res.json()).then(json => {
        return json
    })
}

export const findProgramAddress = async (seeds, programId) => {
    const result = await PublicKey.findProgramAddress(seeds, programId);

    return result[0]
};

export function toPublicKey(key) {
    return new PublicKey(key);
}