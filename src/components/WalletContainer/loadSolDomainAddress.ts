// Address of the SOL TLD
import {PublicKey, Connection} from "@solana/web3.js";
import {getHashedName, getNameAccountKey, NameRegistryState} from "@solana/spl-name-service";

export const SOL_TLD_AUTHORITY = new PublicKey(
    "58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx"
);


export const getInputKey = async (input: string) => {
    let hashed_input_name = await getHashedName(input);
    let inputDomainKey = await getNameAccountKey(
        hashed_input_name,
        undefined,
        SOL_TLD_AUTHORITY
    );
    return { inputDomainKey: inputDomainKey, hashedInputName: hashed_input_name };
};

export const getDomainOwner = async (walletAddress: string, connection:Connection) => {
    const { inputDomainKey } = await getInputKey(walletAddress);
    console.log(inputDomainKey.toString())
    const registry = await NameRegistryState.retrieve(
        connection,
        inputDomainKey
    );
    return registry.owner
}