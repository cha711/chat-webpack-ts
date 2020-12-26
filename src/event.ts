import firebase from './firebase';
import constant from './constant';
import { dom, pushNotification } from './util';
import state from './state';

const _event = {
  login: () => {
    dom(document.getElementById('login')).onclick = async () => {
      // ローディング画面にする
      dom(document.getElementById('_loading')).style.display = 'block';
      dom(document.getElementById('app')).style.display = 'none';

      state.popUp = true;

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
        .then(() => {
          location.reload();
        })
        .catch(e => location.reload());
    };
  },
  logout: () => {
    dom(document.getElementById('logout')).onclick = () => {
      firebase.database().goOffline();
      firebase
        .auth()
        .signOut()
        .then(() => {
          location.reload();
        })
        .catch(() => {});
    };
  },
  post: () => {
    dom(document.getElementById('post')).onclick = async e => {
      if (
        !(document.getElementById('form') as HTMLSelectElement).checkValidity()
      ) {
        return;
      }

      e.preventDefault();

      const _message = (document.getElementById(
        'textarea'
      ) as HTMLSelectElement).value;

      (document.getElementById('textarea') as HTMLSelectElement).value = '';
      document.getElementById('textarea')?.blur();

      // 書き込み
      await firebase
        .database()
        .ref(constant.table.boards)
        .push({
          uid: await firebase.auth().currentUser?.uid,
          uname: (document.getElementById('input') as HTMLSelectElement).value,
          message: _message.trim(),
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
        });

      document.getElementById('textarea')?.focus();

      // lineに通知
      pushNotification((await firebase.auth().currentUser?.uid) as string);
    };
  },
  enter: () => {
    dom(document.getElementById('textarea')).onkeypress = e => {
      if ((e.keyCode || e.charCode || 0) == 13) {
        dom(document.getElementById('post')).click();
      }
    };
  },
};

export default _event;
