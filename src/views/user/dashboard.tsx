import TraitCard from "@/components/common/TraitCard";
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    return () => {
      return (
        <div>
          user dashboard
          <TraitCard />
        </div>
      );
    };
  },
});
