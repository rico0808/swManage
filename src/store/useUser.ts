import router from "@/routers";
import { defineStore } from "pinia";
import { UserStore } from "./types";

const useUserStore = defineStore("User", {
  state: (): UserStore => ({
    profile: null,
  }),
  actions: {
    // 退出登录
    logout() {
      localStorage.clear();
      router.replace({ name: "Root" });
    },

    async GetProfile() {},
  },
});

export default useUserStore;
