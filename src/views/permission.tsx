import router from "@/routers";
import { Button, Result, Space } from "@arco-design/web-vue";
import { defineComponent } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  setup() {
    const route = useRoute();

    const extra = () => {
      return (
        <Space>
          <Button onClick={() => router.replace({ path: route.query.to as string })}>
            回到起点
          </Button>
        </Space>
      );
    };

    return () => {
      return (
        <div class="h-screen flex items-center">
          <Result status="warning" subtitle="这个不属于你" v-slots={{ extra }} />
        </div>
      );
    };
  },
});
