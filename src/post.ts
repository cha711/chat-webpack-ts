import firebase from './firebase';
import constant from './constant';
import { pushNotification } from './util';

export default () => {
  // 投稿
  (document.getElementById('post') as HTMLElement).onclick = async e => {
    if (
      !(document.getElementById('form') as HTMLSelectElement).checkValidity()
    ) {
      return;
    }

    e.preventDefault();

    const _message = (document.getElementById('textarea') as HTMLSelectElement)
      .value;

    (document.getElementById('textarea') as HTMLSelectElement).value = '';
    document.getElementById('textarea')?.blur();

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

  // エンターで送信
  (document.getElementById('textarea') as HTMLElement).onkeypress = e => {
    if ((e.keyCode || e.charCode || 0) == 13) {
      (document.getElementById('post') as HTMLElement).click();
    }
  };
};
