import React, {Component} from 'react';
import {loadWallet} from "./LoadWallet";

class Wallet extends Component {
    constructor() {
        super();

        this.state = {
            walletAddress: "",
            isLoading: false,
            nftMetadata: null
        }

        this.handleChange = this.handleChange.bind(this)
        this.getNFTs = this.getNFTs.bind(this)
    }

    async getNFTs() {
        if (this.state.walletAddress.length === 0) {
            alert("Please enter a valid Solana wallet address!")
        } else {
            this.setState({
                isLoading: true,
                nftMetadata: null
            })
            let nftMetadata = await loadWallet(this.state.walletAddress)
            this.setState({
                isLoading: false,
                nftMetadata: nftMetadata
            })
        }
    }

    handleChange(e) {
        this.setState({walletAddress: e.target.value});
    }


    render() {
        return (

            <div className={"text-center sm:text-left container mx-auto px-4 py-4 font-main"}>
                <div className="pt-4">
                    <p className={"text-2xl font-bold"}>Solana NFT Wallet Explorer</p>
                </div>
                <div className="py-3">
                    <div className="rounded-lg bg-white flex items-center shadow-md">
                        <input className="w-full py-2 px-6 text-gray-700 leading-tight focus:outline-none"
                               onChange={this.handleChange} id="search" type="text"
                               placeholder="Enter Solana Wallet Address:"/>

                        <div className="p-4">
                            <button onClick={() => this.getNFTs()}
                                    className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-400 focus:outline-none w-20 h-12 flex items-center justify-center">
                                Search
                            </button>
                        </div>
                    </div>
                </div>
                {this.state.walletAddress.length > 0 && this.state.nftMetadata !== null ?
                    <div>
                        <p className={"text-4xl py-3 font-bold"}>Wallet Address: <span
                            className={"font-normal"}>{this.state.walletAddress}</span></p>
                        {this.state.nftMetadata.length !== 0 ?
                        <p className={"text-2xl pb-3 font-bold"}>Total Floor Value: <span
                            className={"font-normal"}>Coming Soon!</span></p> : null }
                    </div>
                    : null}
                {this.state.nftMetadata === null ? this.state.isLoading ? <p>
                            Loading NFTs... </p> :
                    <p> </p> : this.state.nftMetadata.length === 0 ? <p> No NFTs found! Go buy some on Solanart / DigitalEyes - #WAGMI</p>:
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-3">
                        {this.state.nftMetadata.map((metadata, i) =>
                            <div key={i} className={"text-center"}>
                                <img className={"rounded-lg shadow-md"} src={metadata.uriJSON.image}/>
                                <p className={"text-center font-bold pt-3"}>{metadata.uriJSON.name}</p>
                            </div>
                        )}

                    </div>
                }
            </div>
        )
    }

}

export default Wallet;
