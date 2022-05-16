import { Table, TableExpandable, Tag } from "@arco-design/web-vue";
import type { TableColumnData } from "@arco-design/web-vue";
import { defineComponent, reactive } from "vue";
import usePagination from "@/hooks/usePagination";
import dayjs from "dayjs";
import { Sales } from "@/api/entity/Sales";
import { TableSlot } from "@/types";
import { SaleGetSales } from "@/api/controllers/SalesController";

const columns: Array<TableColumnData> = [
  { title: "ID", dataIndex: "id", ellipsis: true, width: 50 },
  { title: "订单来源", slotName: "source", align: "center", width: 100 },
  { title: "订单编号", dataIndex: "orderNo", width: 230 },
  { title: "客户用户名", dataIndex: "client", width: 150 },
  { title: "金额", slotName: "amount", align: "center", width: 100 },
  { title: "备注信息", dataIndex: "remark", ellipsis: true },
  { title: "状态", slotName: "status", align: "center", width: 100 },
  { title: "创建时间", slotName: "createAt", align: "center", width: 200 },
];

export default defineComponent({
  setup() {
    const { dataList, pagination, onChange, loading } = usePagination(SaleGetSales);

    const expandable = reactive<TableExpandable>({
      width: 40,
      expandedRowRender: ({ raw }: { raw: Sales }) => {
        if (!raw.detail) return;
        return <div>{JSON.stringify(raw.detail)}</div>;
      },
    });

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
            expandable={expandable}
            rowKey="id"
            v-slots={{
              source: ({ record }: TableSlot<Sales>) => {
                if (record.source === "tb") return <Tag color="#ffb400">淘宝</Tag>;
                if (record.source === "pdd") return <Tag color="#f53f3f">拼多多</Tag>;
              },
              amount: ({ record }) => `${record.amount} ¥`,
              status: ({ record }: TableSlot<Sales>) => {
                if (record.status === 0) return <Tag color="red">已退款</Tag>;
                if (record.status === 1) return <Tag color="green">已发货</Tag>;
              },
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
