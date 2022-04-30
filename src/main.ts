import { createApp } from "vue";
import App from "./App";
import router from "./routers";
import "virtual:windi.css";
import "./static/less/arcoReset.less";
import vPermission from "./plugins/vPermission";
import { createPinia } from "pinia";

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.directive("Permission", vPermission);
app.mount("#app");
