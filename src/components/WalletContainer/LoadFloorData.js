import firebase from "firebase/compat";
import 'firebase/firestore'

import firebaseConfig from './firebase-config'
import {CollectionToUpdateAuthority} from "./CollectionData";


firebase.initializeApp(firebaseConfig);
export const firestore = firebase.firestore();

export async function loadFloorData() {

    let snapshot = await firestore.doc('api/floor-data').get()
    const data = snapshot.data()
    let floorData = data['solanalysis']

    var updateAuthorityToPrice = {}
    for (let collectionName of Object.keys(floorData)) {
        if (CollectionToUpdateAuthority[collectionName] instanceof Array) {
            for (let updateAuthority of CollectionToUpdateAuthority[collectionName]) {
                updateAuthorityToPrice[updateAuthority] = floorData[collectionName]
            }
        } else {
            updateAuthorityToPrice[CollectionToUpdateAuthority[collectionName]] = floorData[collectionName]
        }
    }

    const lastUpdated = data['last_updated'].toDate()
    const lastUpdatedString = lastUpdated.toLocaleDateString() + " " + lastUpdated.toLocaleTimeString()

    return [updateAuthorityToPrice, lastUpdatedString]
}

export async function loadSolanaPrice(updatePrice) {
    const url = "https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT";
    fetch(url)
        .then(response => response.json())
        .then(data => updatePrice(data['price']));
}

