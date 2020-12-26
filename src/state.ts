const ifvisible = require('ifvisible.js');
import firebase from './firebase';

const state = {
  popUp: false,
};

// 画面がアクティブになったら
ifvisible.on('focus', () =>
  !state.popUp ? firebase.database().goOnline() : ''
);

// 画面がオフになったら
ifvisible.on('blur', () => firebase.database().goOffline());

export default state;
