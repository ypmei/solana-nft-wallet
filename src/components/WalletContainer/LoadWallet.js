import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { deserializeUnchecked } from 'borsh';
import { serverTimestamp } from '@firebase/firestore';
// import { NameRegistryState } from '@solana/spl-name-service';
// import { Metadata, METADATA_SCHEMA } from './Metadata';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

import { firestore } from './LoadFloorData';
import { getDomainOwner } from './loadSolDomainAddress';

const SEED = 'metadata';
const METADATA_PROGRAM_ID = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';
const SOLANA_TOKEN_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

export const toPublicKey = (key) => new PublicKey(key);

const getJSONFromURI = async (uri) =>
  fetch(uri)
    .then((res) => res.json())
    .then((json) => {
      return json;
    });

// return first program address
export const findProgramAddress = async (seeds, programId) =>
  (await PublicKey.findProgramAddress(seeds, programId))[0];

export const loadWallet = async (walletAddress, totalCountCallback, currentCountCallback) => {
  // const connection = new Connection("https://dark-summer-dew.solana-mainnet.quiknode.pro/431dccc44f65b6985822f912053640645ae71683/")
  const connection = new Connection(clusterApiUrl('mainnet-beta'));

  let walletPK = '';

  try {
    if (walletAddress.slice(walletAddress.length - 4) === '.sol') {
      walletPK = await getDomainOwner(walletAddress, connection);
    } else {
      walletPK = toPublicKey(walletAddress);
    }
  } catch (e) {
    console.log(e);
    alert("Couldn't find wallet at that address. Please enter a valid wallet address.");
    return null;
  }

  // Array of all token accounts in user's wallet
  const tokens = (
    await connection.getParsedTokenAccountsByOwner(walletPK, { programId: SOLANA_TOKEN_ID })
  ).value;

  // Filter tokens by decimal and value
  const nonFungibleTokens = tokens.filter(
    (token) =>
      token.account.data.parsed.info.tokenAmount.amount === '1' &&
      token.account.data.parsed.info.tokenAmount.decimals === 0
  );
  totalCountCallback(nonFungibleTokens.length);

  const uploadToFirebase = {};
  const nftMetadata = [];
  let count = 0;

  // Check to see if this is the first time seeing this wallet
  const doc = await firestore.doc(`wallets/${walletAddress}`).get();
  let seenWallet = true;
  if (!doc.exists) {
    // If this is the first time seeing this wallet, we want to load every NFT from the API and save this wallet address to Firebase
    await firestore.doc(`wallets/${walletAddress}`).set({ lastAccessed: serverTimestamp() });
    seenWallet = false;
  }

  for (const token of nonFungibleTokens) {
    try {
      count += 1;
      currentCountCallback(count);
      const mintAddress = toPublicKey(token.account.data.parsed.info.mint);

      // If we're supposed to check Firebase (only on seen wallets), attempt to load metadata
      let metadataInFirebase = false;
      if (seenWallet) {
        if (doc.data()[mintAddress.toString()]) {
          metadataInFirebase = true;
        }
      }

      // If we're not supposed to check Firebase OR the document from firebase doesn't exist, ping the API
      if (!seenWallet || !metadataInFirebase) {
        // const seeds = [
        //   Buffer.from(SEED),
        //   toPublicKey(METADATA_PROGRAM_ID).toBuffer(),
        //   mintAddress.toBuffer(),
        // ];
        // const pdaAccount = await findProgramAddress(seeds, toPublicKey(METADATA_PROGRAM_ID));
        // const pdaAccountInfo = await connection.getParsedAccountInfo(pdaAccount);
        // const pdaAccountData = pdaAccountInfo.value.data;
        //
        // const metadata = new Metadata(
        //   deserializeUnchecked(METADATA_SCHEMA, Metadata, pdaAccountData)
        // );
        // Add URI JSON to metadata
        // metadata.uriJSON = await getJSONFromURI(metadata.data.uri);

        // Update Firebase with this NFT + metadata
        // uploadToFirebase[mintAddress.toString()] = JSON.stringify(metadata);
        // firestore.doc('metadata/'+mintAddress.toString()).set({"metadata":JSON.stringify(metadata)})

        const tokenmetaPubkey = await Metadata.getPDA(mintAddress);
        const metadata = await Metadata.load(connection, tokenmetaPubkey);
        metadata.token = token;
        metadata.uriJSON = await getJSONFromURI(metadata.data.data.uri);
        // Push metadata
        nftMetadata.push(metadata);
      } else {
        // Push metadata
        const metadata = JSON.parse(doc.data()[mintAddress.toString()]);
        metadata.token = token;
        nftMetadata.push(metadata);
      }
    } catch (e) {
      console.log(e);
    }
  }

  if (Object.keys(uploadToFirebase).length > 0) {
    firestore.doc(`wallets/${walletAddress}`).update(uploadToFirebase);
  }

  // return nftMetadata.sort((a, b) => a.updateAuthority.localeCompare(b.updateAuthority));

  const parsedMetaData = nftMetadata.map((metaData) => {
    const { token, uriJSON } = metaData;
    const { mint, owner, tokenAmount } = token.account.data.parsed.info;
    const { name, image, description } = uriJSON;
    return {
      mint,
      account: owner,
      amount: tokenAmount,
      name,
      image,
      description,
      animationUrl: uriJSON.animation_url,
    };
  });

  console.log('解析后的metadata的结果集：', parsedMetaData);

  return nftMetadata;
};
