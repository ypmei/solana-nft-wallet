// Address of the SOL TLD
import { PublicKey, Connection } from '@solana/web3.js';
import { getHashedName, getNameAccountKey, NameRegistryState } from '@solana/spl-name-service';

export const SOL_TLD_AUTHORITY = new PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx');

export const getInputKey = async (input: string) => {
  const hashedInputName = await getHashedName(input);
  const inputDomainKey = await getNameAccountKey(hashedInputName, undefined, SOL_TLD_AUTHORITY);
  return { inputDomainKey, hashedInputName };
};

export const getDomainOwner = async (walletAddress: string, connection: Connection) => {
  const { inputDomainKey } = await getInputKey(walletAddress);
  console.log(inputDomainKey.toString());
  const registry = await NameRegistryState.retrieve(connection, inputDomainKey);
  return registry.owner;
};
