const ifvisible = require('ifvisible.js');
import firebase from './firebase';

const state = {
  active: true,
  popUp: false,
  setActive: function (bol: boolean) {
    if (bol && !this.popUp) {
      // 再接続
      firebase.database().goOnline();
    } else {
      // 切断
      firebase.database().goOffline();
    }
  },
  setPopUp: function (bol: boolean) {
    this.popUp = bol;
  },
};

ifvisible.on('focus', () => state.setActive(true));
ifvisible.on('blur', () => state.setActive(false));

export default state;
