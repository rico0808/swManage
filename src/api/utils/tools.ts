export const onResult = <T>(data: T, msg = "奥力给！"): Res<T> => {
  return { data, msg };
};

export class onFaild extends Error {
  status: number;
  data: null;
  constructor(msg: string, status = 400) {
    super();
    this.status = status;
    this.message = msg;
    this.data = null;
  }
}

// 生成随机数
export const RandomCode = () => {
  return Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
};

// 生成随机字母
export const RandomLetter = (length: number) => {
  const result = [];
  for (let i = 0; i < length; i++) {
    const ranNum = Math.ceil(Math.random() * 25);
    result.push(String.fromCharCode(65 + ranNum));
  }
  return result.join("");
};
