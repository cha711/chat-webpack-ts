import * as _ from 'lodash';

import firebase from './firebase';
import constant from './constant';
import { dom, pushNotification } from './util';
import setList from './list';
import _event from './event';

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
      .ref(constant.table.connections)
      .on('value', s => {
        dom(document.getElementById('_su')).textContent =
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

        // ローディング画面から遷移
        dom(document.getElementById('_loading')).style.display = 'none';
        dom(document.getElementById('app')).style.display = 'block';

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
      // ログインボタンを描画する
      dom(document.getElementById('button')).innerHTML = `
      <button type="button" class="btn btn-danger" id="logout">ログアウト</button>
    `;

      _event.logout();
    } else {
      // ログアウトボタンを描画する
      dom(document.getElementById('button')).innerHTML = `
      <button type="button" class="btn btn-success" id="login">ログイン</button>
    `;

      _event.login();
    }

    // lineに通知
    pushNotification((await firebase.auth().currentUser?.uid) as string);

    _list();
  });
};
