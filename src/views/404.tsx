import router from "@/routers";
import { Button, Result, Space } from "@arco-design/web-vue";
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    const extra = () => {
      return (
        <Space>
          <Button onClick={() => router.go(-1)}>回到起点</Button>
        </Space>
      );
    };

    return () => {
      return (
        <div class="h-screen flex items-center">
          <Result
            status="404"
            subtitle="失去了就失去了，就不要再去想它了。"
            v-slots={{ extra }}
          />
        </div>
      );
    };
  },
});
