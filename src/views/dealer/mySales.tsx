import { Table, Tag } from "@arco-design/web-vue";
import type { TableColumnData } from "@arco-design/web-vue";
import { defineComponent } from "vue";
import usePagination from "@/hooks/usePagination";
import dayjs from "dayjs";
import { Sales } from "@/api/entity/Sales";
import { TableSlot } from "@/types";
import { SaleGetSales } from "@/api/controllers/SalesController";

export default defineComponent(() => {
  const { dataList, pagination, onChange, loading } = usePagination(SaleGetSales);

  const columns: Array<TableColumnData> = [
    { title: "ID", dataIndex: "id", ellipsis: true, width: 70 },
    { title: "订单来源", slotName: "source", align: "center" },
    { title: "订单编号", dataIndex: "orderNo", align: "center" },
    { title: "客户用户名", dataIndex: "client" },
    { title: "金额", slotName: "amount", align: "center" },
    { title: "备注信息", dataIndex: "remask", ellipsis: true },
    { title: "状态", slotName: "status", align: "center" },
    { title: "创建时间", slotName: "createAt", align: "center" },
  ];

  const render = () => {
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

  return render;
});
