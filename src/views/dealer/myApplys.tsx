import {
  Form,
  FormItem,
  Input,
  Link,
  Message,
  Modal,
  Popconfirm,
  Table,
  Tag,
} from "@arco-design/web-vue";
import type { TableColumnData } from "@arco-design/web-vue";
import { defineComponent, reactive, ref } from "vue";
import usePagination from "@/hooks/usePagination";
import dayjs from "dayjs";
import { TableSlot } from "@/types";
import { ApplyGetApplys, ApplyHandleApplys } from "@/api/controllers/ApplysController";
import { Applys } from "@/api/entity/Apply";
import { FormInput } from "@/components/form";

const columns: Array<TableColumnData> = [
  { title: "ID", dataIndex: "id", ellipsis: true, width: 50 },
  { title: "用户账号", dataIndex: "phone", align: "center", width: 150 },
  { title: "店铺地址", slotName: "url", align: "center", width: 130 },
  { title: "主营业务", dataIndex: "business", width: 200 },
  { title: "理由", dataIndex: "reason", width: 250 },
  { title: "状态", slotName: "status", align: "center", width: 100 },
  { title: "申请时间", slotName: "createAt", align: "center", width: 200 },
  { title: "操作", slotName: "actions", align: "center", width: 120 },
];

export default defineComponent({
  setup() {
    const { dataList, pagination, onChange, loading, reload } =
      usePagination(ApplyGetApplys);

    const reason = ref("");

    // 同意
    const handlePassApply = async (id) => {
      const res = await ApplyHandleApplys({ id, status: 3, reason: "" });
      if (res?.data) {
        Message.success("分销申请审核成功");
        reload();
      }
    };

    // 拒绝
    const handleRejectApply = (id) => {
      ApplyHandleApplys({ id, status: 2, reason: reason.value }).then((res) => {
        if (res?.data) {
          Message.success("分销申请拒绝成功");
          reload();
        }
      });
    };

    return () => {
      return (
        <div>
          <div class="table__card">
            <Table
              columns={columns}
              data={dataList.value}
              loading={loading.value}
              pagination={pagination}
              onPageSizeChange={onChange.pageSize}
              onPageChange={onChange.current}
              rowKey="id"
              v-slots={{
                url: ({ record }: TableSlot<Applys>) => (
                  <Link href={record.url} icon>
                    预览店铺
                  </Link>
                ),
                status: ({ record }: TableSlot<Applys>) => {
                  if (record.status === 1) return <Tag color="orange">待审批</Tag>;
                  if (record.status === 2) return <Tag color="red">已拒绝</Tag>;
                  if (record.status === 3) return <Tag color="green">已通过</Tag>;
                },
                createAt: ({ record }: TableSlot<Applys>) => {
                  return dayjs(record.createAt).format("YYYY-MM-DD HH:mm:ss");
                },
                actions: ({ record }: TableSlot<Applys>) => {
                  if (record.status === 1) {
                    return (
                      <div>
                        <Link status="success" onClick={() => handlePassApply(record.id)}>
                          通过
                        </Link>

                        <Popconfirm
                          v-slots={{
                            content: () => (
                              <Input v-model={reason.value} placeholder="拒绝理由" />
                            ),
                          }}
                          onBeforeOk={() => handleRejectApply(record.id)}
                        >
                          <Link status="danger">拒绝</Link>
                        </Popconfirm>
                      </div>
                    );
                  }
                },
              }}
            />
          </div>
        </div>
      );
    };
  },
});
