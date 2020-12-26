const reactStringReplace = require('react-string-replace');
import * as _ from 'lodash';
import moment from 'moment';
moment.locale('ja');

import firebase from './firebase';

const getMessage = (messages: string[]) => {
  return messages.reduce(
    (accumulator: string, child: string | { match: string }) => {
      if (_.isString(child)) {
        accumulator += _.escape(child);
        return accumulator;
      }

      accumulator += `<a href="${child['match']}" target="_blank" rel="noopener noreferrer">${child['match']}</a>`;
      return accumulator;
    },
    ''
  );
};

export default async (
  list: { uid: string; uname: string; createdAt: number; message: string }[]
) => {
  document.getElementsByClassName('line-bc')[0].innerHTML = '';

  const _uid = await firebase.auth().currentUser?.uid;
  list.map(m => {
    const _messages = reactStringReplace(
      m.message,
      /(https?:\/\/\S+)/g,
      (match: string) => {
        return { match: match };
      }
    );

    // 右
    if (m.uid === _uid) {
      const _html = `
        <div>
          <div class="clearfix">
            <div class="float-right">
              <div style="color: #fff; font-size: 12px;">
                ${m.uname === undefined ? '名無し' : _.escape(m.uname)}
              </div>
              <div style="color: #fff; font-size: 12px;">
                ${_.escape(m.uid)}
              </div>
            </div>
          </div>

          <div class="clearfix">
            <div class="balloon2 float-right">
              ${getMessage(_messages)}
            </div>
          </div>

          <div class="clearfix">
            <div class="float-right">
              <time style="font-size: 12px;">
                ${_.escape(
                  moment(new Date(m.createdAt)).format('YYYY-MM-DD HH:mm:ss')
                )}
              </time>
            </div>
          </div>
          <br />
        </div>
      `;
      document.getElementsByClassName('line-bc')[0].innerHTML += _html;
      return;
    }

    // 左
    const _html = `
      <div>
        <div style="color: #fff; font-size: 12px;">
          ${m.uname === undefined ? '名無し' : _.escape(m.uname)}
        </div>

        <div style="color: #fff; font-size: 12px;">
          ${_.escape(m.uid)}
        </div>

        <div class="clearfix">
          <div class="balloon1 float-left">
            ${getMessage(_messages)}
          </div>
        </div>

        <div class="clearfix">
          <time style="font-size: 12px;">
            ${_.escape(
              moment(new Date(m.createdAt)).format('YYYY-MM-DD HH:mm:ss')
            )}
          </time>
        </div>
        <br />
      </div>
    `;

    document.getElementsByClassName('line-bc')[0].innerHTML += _html;
  });
};
