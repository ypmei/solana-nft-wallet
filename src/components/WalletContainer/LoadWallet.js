import {clusterApiUrl, Connection, PublicKey} from "@solana/web3.js";
import {deserializeUnchecked} from "borsh";
import {Metadata, METADATA_SCHEMA} from "./Metadata";

const SEED = "metadata"
const METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
const SOLANA_TOKEN_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")

export async function loadWallet(walletAddress, totalCountCallback, currentCountCallback) {
    const connection = new Connection(clusterApiUrl('mainnet-beta'))
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

    let nftMetadata = []
    let count = 0
    for (let token of nonFungibleTokens) {
        try {
            count++;
            currentCountCallback(count);
            const mintAddress = toPublicKey(token.account.data.parsed.info.mint)

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

            nftMetadata.push(metadata)
        } catch (e) {
            console.log(e)
        }
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