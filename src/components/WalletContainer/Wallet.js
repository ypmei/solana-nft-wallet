import React, {Component} from 'react';
import {loadWallet} from "./LoadWallet";

class Wallet extends Component {
  constructor() {
    super();

    this.state = {
      walletAddress: "CmwMaWGAwCXqjWSS5FXJfEVuwxV8eDsfAbWgZmvEyjgY",
      nftMetadata: []
    }

    this.getNFTs()
  }

  async getNFTs() {
    let nftMetadata = await loadWallet("CmwMaWGAwCXqjWSS5FXJfEVuwxV8eDsfAbWgZmvEyjgY")
    console.log(nftMetadata)
    this.setState({
      nftMetadata: nftMetadata
    })
  }

  render() {
    return(

        <div className={"text-center sm:text-left container mx-auto px-4 py-4 font-main"}>
          <p className={"text-4xl py-3 font-bold"}>Wallet Address: <span className={"font-normal"}>{this.state.walletAddress}</span></p>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-3">
          {this.state.nftMetadata.map((metadata, i) =>
              <div className={"text-center"}>
                    <img className={"rounded-lg shadow-md"} src={metadata.uriJSON.image}/>
                    <p className={"text-center font-bold pt-3"}>{metadata.uriJSON.name}</p>
              </div>
          )}
          </div>
        </div>
    )
  }

}

export default Wallet;
