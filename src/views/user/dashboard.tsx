import useUserStore from "@/store/useUser";
import { defineComponent } from "vue";
import UserDashboard from "./component/UserDashboard";

export default defineComponent({
  setup() {
    const { isUser, isDealer, isAdmin } = useUserStore();

    const Dashboard = () => {
      if (isUser) return <UserDashboard />;
    };
    return () => <Dashboard />;
  },
});
