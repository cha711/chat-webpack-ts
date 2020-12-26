import constant from './constant';

export const dom = (d: HTMLElement | null) => {
  return d as HTMLElement;
};

// プッシュ通知
export const pushNotification = async (message: string) => {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  fetch(constant.pushNotification.url, {
    method: 'post',
    headers: {
      Authorization: constant.pushNotification.authorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
    }),
  });
};
