import { Table, Tag } from "@arco-design/web-vue";
import type { TableColumnData } from "@arco-design/web-vue";
import { defineComponent } from "vue";
import usePagination from "@/hooks/usePagination";
import { SpendGetSpend } from "@/api/controllers/SpendController";
import dayjs from "dayjs";

export default defineComponent({
  setup() {
    const { dataList, pagination, onChange, loading } = usePagination(SpendGetSpend);

    const columns: Array<TableColumnData> = [
      { title: "ID", dataIndex: "id", ellipsis: true, width: 70 },
      { title: "类型", slotName: "type", width: 100, align: "center" },
      { title: "金额", slotName: "amount", align: "center" },
      { title: "详细信息", dataIndex: "remark", ellipsis: true },
      { title: "创建时间", slotName: "createAt", ellipsis: true, align: "center" },
    ];

    return () => {
      return (
        <div class="table__card">
          <Table
            columns={columns}
            data={dataList.value}
            loading={loading.value}
            pagination={pagination}
            onPageSizeChange={onChange.pageSize}
            onPageChange={onChange.current}
            v-slots={{
              type: ({ record }) => {
                return record.type ? (
                  <Tag color="green">收入</Tag>
                ) : (
                  <Tag color="orange">支出</Tag>
                );
              },
              amount: ({ record }) => `${record.amount} ¥`,
              createAt: ({ record }) => {
                return dayjs(record.createAt).format("YYYY-MM-DD HH:mm:ss");
              },
            }}
          />
        </div>
      );
    };
  },
});
