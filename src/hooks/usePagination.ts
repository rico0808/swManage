import { onMounted, reactive, ref } from "vue";

export default function usePagination<T>(fn: Function) {
  const pagination = reactive({
    pageSize: 20,
    current: 1,
    total: 0,
  });
  const loading = ref(false);
  const dataList = ref<Array<T>>([]);

  const reload = async () => {
    loading.value = true;
    const { data } = await fn({
      pageSize: pagination.pageSize,
      current: pagination.current,
    });
    dataList.value = data.list;
    pagination.total = data.count;
    loading.value = false;
  };

  onMounted(async () => await reload());

  const onChange = {
    current: async (e: number) => {
      pagination.current = e;
      await reload();
    },
    pageSize: async (e: number) => {
      pagination.pageSize = e;
      await reload();
    },
  };

  return { onChange, dataList, pagination, loading, reload };
}
