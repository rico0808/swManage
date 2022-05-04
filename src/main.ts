import { createApp } from "vue";
import App from "./App";
import router from "./routers";
import "virtual:windi.css";
import "./static/less/arcoReset.less";
import vPermission from "./plugins/vPermission";
import { createPinia } from "pinia";
import { setupHttpClient } from "@midwayjs/rpc";
import { RequestIntercept } from "./middleware";

setupHttpClient({
  middleware: [RequestIntercept],
});

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.directive("Permission", vPermission);
app.use(router);
app.mount("#app");
