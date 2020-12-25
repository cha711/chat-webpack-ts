import * as _ from 'lodash';

import firebase from './firebase';
import constant from './constant';
import { pushNotification } from './util';
import state from './state';
import setList from './list';

export default () => {
  const _connectionMonitoring = async () => {
    const presenceRef = firebase.database().ref('/.info/connected');
    const listRef = firebase
      .database()
      .ref(
        constant.table.connections +
          '/' +
          (await firebase.auth().currentUser?.uid)
      );
    const userRef = listRef.push();

    presenceRef.on('value', async snap => {
      if (snap.val()) {
        userRef.onDisconnect().remove();
        userRef.set(await firebase.auth().currentUser?.uid);
      }
    });

    firebase
      .database()
      .ref('connections')
      .on('value', s => {
        (document.getElementById('_su') as HTMLElement).textContent =
          '接続ユーザ数: ' + s.numChildren();
      });
  };

  const _list = () => {
    firebase
      .database()
      .ref(constant.table.boards)
      .orderByChild('createdAt')
      .limitToLast(50)
      .on('value', snapshot => {
        let _data: any[] = [];
        snapshot.forEach(childSnapshot => {
          _data.push(childSnapshot.val());
        });

        setList(_.orderBy(_data, 'createdAt', 'desc'));

        // くるくるもどす
        (document.getElementById('_loading') as HTMLElement).style.display =
          'none';
        (document.getElementById('app') as HTMLElement).style.display = 'block';

        _connectionMonitoring();
      });
  };

  firebase.auth().onAuthStateChanged(async data => {
    if (data === null) {
      // 匿名ログイン
      await firebase.auth().signInAnonymously();
      return;
    }

    if (data.providerData.length !== 0) {
      (document.getElementById('button') as HTMLElement).innerHTML = `
        <button type="button" class="btn btn-danger" id="logout">ログアウト</button>
      `;

      (document.getElementById('logout') as HTMLElement).onclick = () => {
        firebase.database().goOffline();
        firebase
          .auth()
          .signOut()
          .then(() => {
            location.reload();
          })
          .catch(error => {});
      };
    } else {
      (document.getElementById('button') as HTMLElement).innerHTML = `
        <button type="button" class="btn btn-success" id="login">ログイン</button>
      `;

      (document.getElementById('login') as HTMLElement).onclick = async () => {
        // ローディング画面にする
        (document.getElementById('_loading') as HTMLElement).style.display =
          'block';
        (document.getElementById('app') as HTMLElement).style.display = 'none';

        state.setPopUp(true);

        // delete connections
        firebase
          .database()
          .ref(constant.table.connections)
          .child((await firebase.auth().currentUser?.uid) as string)
          .remove();

        const provider = new firebase.auth.TwitterAuthProvider();
        firebase
          .auth()
          .signInWithPopup(provider)
          .then(async result => {
            location.reload();
          })
          .catch(e => location.reload());
      };
    }

    // lineに通知
    pushNotification((await firebase.auth().currentUser?.uid) as string);

    _list();
  });
};
