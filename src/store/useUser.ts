import { AuthUserLogin } from "@/api/controllers/AuthController";
import { ZodLogin } from "@/api/controllers/AuthController/schema";
import { UserGetProfile } from "@/api/controllers/ProfileController";
import { Users } from "@/api/entity/Users";
import router from "@/routers";
import _ from "lodash";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { z } from "zod";

const useUserStore = defineStore("User", () => {
  const profile = ref<Omit<Users, "passwd">>();
  const role = computed(() => profile.value?.role || "user");
  const isAdmin = computed(() => role.value === "admin");
  const isDealer = computed(() => role.value === "dealer");
  const isUser = computed(() => role.value === "user");

  // 获取用户信息
  const GetProfile = async () => {
    const res = await UserGetProfile();
    profile.value = res?.data;
    return res;
  };

  // 登录
  const Login = async (formData: z.infer<typeof ZodLogin>) => {
    const res = await AuthUserLogin(formData);
    if (!res?.data) return;
    profile.value = res.data;
    localStorage.setItem("isLogin", "true");
    router.push({ name: "UserDashboard" });
  };

  return { profile, GetProfile, Login, role, isAdmin, isDealer, isUser };
});

export default useUserStore;
