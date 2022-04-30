import { defineComponent } from "vue";
import { RouterView } from "vue-router";

export default defineComponent(() => {
  const render = () => {
    return <RouterView />;
  };
  return render;
});
