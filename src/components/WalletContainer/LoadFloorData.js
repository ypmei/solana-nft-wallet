import firebase from 'firebase/compat';
import 'firebase/firestore';

import firebaseConfig from './firebase-config.json';
// import { CollectionToUpdateAuthority } from './CollectionData';

firebase.initializeApp(firebaseConfig);
export const firestore = firebase.firestore();

export const loadFloorData = async () => {
  const snapshot = await firestore.doc('api/floor-data').get();
  const data = snapshot.data();

  const uaSnapshot = await firestore.doc('api/update-authority-data').get();
  const uaData = uaSnapshot.data().alldata;

  const lowercaseKeys = (obj) =>
    Object.keys(obj).reduce((acc, key) => {
      acc[key.toLowerCase().replace(/\s+/g, '')] = obj[key];
      return acc;
    }, {});

  const getName = (key) => key;
  const getValue = (obj, key) => obj[getName(key)] ?? Infinity;

  const mergeFloorData = (a, b) =>
    [...Object.keys(a), ...Object.keys(b)].reduce(
      (prev, curr) => ({
        ...prev,
        [curr]: getValue(a, curr) < getValue(b, curr) ? getValue(a, curr) : getValue(b, curr),
      }),
      {}
    );

  const collectionToUpdateAuthority = lowercaseKeys(uaData);
  const magicEdenFloorData = lowercaseKeys(data.magiceden);
  const solanartFloorData = lowercaseKeys(data.solanart);

  const replaceKey = (oldKey, newKey, oldData) =>
    delete Object.assign(oldData, { [newKey]: solanartFloorData[oldKey] })[oldKey];

  // Fix Solana's Key naming
  replaceKey('degenapeacademy', 'degenerateapeacademy', solanartFloorData);
  replaceKey('degenlizzy', 'degenlizzynft', solanartFloorData);
  replaceKey('galacticgeckospacegarage', 'galacticgeckos', solanartFloorData);
  replaceKey('rox', 'roxcollective', solanartFloorData);
  replaceKey('skeletoncrew', 'skeletoncrewskulls', solanartFloorData);

  const floorData = mergeFloorData(magicEdenFloorData, solanartFloorData);
  console.log(floorData);

  const updateAuthorityToPrice = {};
  for (let collectionName of Object.keys(floorData)) {
    collectionName = collectionName.toLowerCase();
    if (collectionToUpdateAuthority[collectionName] instanceof Array) {
      for (const updateAuthority of collectionToUpdateAuthority[collectionName]) {
        updateAuthorityToPrice[updateAuthority] = floorData[collectionName];
      }
    } else {
      updateAuthorityToPrice[collectionToUpdateAuthority[collectionName]] =
        floorData[collectionName];
    }
  }

  const lastUpdated = data.last_updated.toDate();
  const lastUpdatedString = `${lastUpdated.toLocaleDateString()} ${lastUpdated.toLocaleTimeString()}`;

  return [updateAuthorityToPrice, lastUpdatedString];
};

export const loadSolanaPrice = async (updatePrice) =>
  fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT')
    .then((response) => response.json())
    .then((data) => updatePrice(data.price));
