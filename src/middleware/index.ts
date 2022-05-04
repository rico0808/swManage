import router from "@/routers";
import { Message } from "@arco-design/web-vue";
import { Middleware } from "@midwayjs/rpc";

export const RequestIntercept: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const { status = 500, data = {} } = err;
    switch (status) {
      case 401:
        localStorage.clear();
        router.push({ name: "Login" });
        break;
      case 422:
        const { list = [] } = data;
        list.forEach((item) => Message.warning(item.msg));
        break;
      case 500:
        Message.error(data.msg || "远端错误");
        break;
      default:
        Message.error(data.msg || "发送请求失败");
        break;
    }
  }
};
