import React, {Component} from 'react';
import {loadWallet} from "./LoadWallet";
import {loadFloorData} from "./LoadFloorData";

class Wallet extends Component {
    constructor() {
        super();

        this.state = {
            walletAddress: "",
            isLoading: false,
            nftMetadata: null,
            floorData: null
        }


        this.handleChange = this.handleChange.bind(this)
        this.getNFTs = this.getNFTs.bind(this)
        this.calculateTotalFloorValue = this.calculateTotalFloorValue.bind(this)

        this.getNFTFloorData()
    }

    async getNFTFloorData() {
        let floorData = await loadFloorData()
        this.setState({
            floorData: floorData[0],
            floorLastUpdated: floorData[1]
        })
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

    calculateTotalFloorValue() {
        var totalFloorPrice = 0.0
        for (let nft of this.state.nftMetadata) {
            const floorPrice = this.state.floorData[nft.updateAuthority] ? this.state.floorData[nft.updateAuthority] : 0

            totalFloorPrice += floorPrice
        }
        return Math.round(totalFloorPrice * 10) / 10
    }


    render() {
        return (

            <div className={"text-center sm:text-left container mx-auto px-4 py-4 font-main"}>
                <div className="pt-4 flex justify-between">
                    <p className={"text-2xl font-bold"}>Solana NFT Wallet Explorer</p>
                    <p className={"text-gray-500 text-base"}>Sol Tip Jar: EfJeswRanMNzkkLxZN7d9WL5sbm5Z9qfi3EDazZUUCCW</p>
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
                        <p className={"text-3xl py-3 font-bold"}>Wallet Address: <span
                            className={"font-normal text-2xl"}>{this.state.walletAddress}</span></p>
                        {this.state.nftMetadata.length !== 0 && this.state.floorData ?
                            <div>
                                <p className={"text-2xl font-bold"}>Total Floor Value: <span
                                    className={"font-normal"}>{this.calculateTotalFloorValue() + "◎"}</span></p>
                                <p className={"text-gray-500 pb-3 text-base"}>Floor prices updated every hour. Last updated: {this.state.floorLastUpdated}</p>
                                {/*<p className={"text-gray-500 pb-3 text-base"}>Add more NFT collections to our API <a>here</a>.</p>*/}
                            </div> : null}
                    </div>
                    : null}
                {this.state.nftMetadata === null ? this.state.isLoading ? <p className={"flex"}>
                        <svg width="24" height="24" className="inline-block mr-2" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#bbb">
                            <g fill="none" fill-rule="evenodd">
                                <g transform="translate(1 1)" stroke-width="2">
                                    <circle stroke-opacity=".5" cx="18" cy="18" r="18"/>
                                    <path d="M36 18c0-9.94-8.06-18-18-18">
                                        <animateTransform
                                            attributeName="transform"
                                            type="rotate"
                                            from="0 18 18"
                                            to="360 18 18"
                                            dur="1s"
                                            repeatCount="indefinite"/>
                                    </path>
                                </g>
                            </g>
                        </svg>
                        Loading NFTs... </p> :
                    <p></p> : this.state.nftMetadata.length === 0 ?
                    <p> No NFTs found! Go buy some on Solanart / DigitalEyes - #WAGMI</p> :
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-3">
                        {this.state.nftMetadata.map((metadata, i) =>
                            <div key={i} className={"text-center"}>
                                <img className={"rounded-lg shadow-md"} src={metadata.uriJSON.image}/>
                                <div className={"flex-col"}>
                                    <p className={"text-left font-bold pt-3 flex-initial"}>{metadata.uriJSON.name}</p>
                                    {this.state.floorData ?
                                        <p className={"text-left text-gray-500 pt-1 flex-none"}>{this.state.floorData[metadata.updateAuthority] ? this.state.floorData[metadata.updateAuthority] + "◎" : "N/A"}</p> : null}
                                </div>
                            </div>
                        )}

                    </div>
                }
            </div>
        )
    }

}

export default Wallet;
