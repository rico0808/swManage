import usePagination from "@/hooks/usePagination";
import type { TableSlot } from "@/types";
import { Table, Message, Tag, Link, Popconfirm } from "@arco-design/web-vue";
import _ from "lodash";
import { defineComponent } from "vue";
import type { TableColumnData } from "@arco-design/web-vue";
import {
  UserDeleteUser,
  UserDisableUser,
  UserGetUsers,
} from "@/api/controllers/UserController";
import { Users } from "@/api/entity/Users";

export default defineComponent(() => {
  const { pagination, dataList, loading, onChange, reload } = usePagination(UserGetUsers);

  const handleDisableUser = async (id: number, status: number) => {
    const res = await UserDisableUser({ id, status: status ? 0 : 1 });
    if (res) {
      reload();
      Message.success(`${status ? "禁用" : "启用"}用户成功`);
    }
  };

  const handleDeleteUser = async (id: number) => {
    const res = await UserDeleteUser({ id });
    if (res) {
      reload();
      Message.success("删除用户成功");
    }
  };

  const columns: Array<TableColumnData> = [
    { title: "ID", dataIndex: "id", ellipsis: true, width: 50 },
    { title: "手机号", dataIndex: "phone", align: "center" },
    { title: "余额", slotName: "blance", align: "center" },
    { title: "客户数量", dataIndex: "clients", align: "center" },
    { title: "权限", slotName: "role", align: "center" },
    { title: "状态", slotName: "status", align: "center" },
    { title: "操作", slotName: "actions", width: 180, align: "center" },
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
            blance: ({ record }: TableSlot<Users>) => `${record.blance} ¥`,
            role: ({ record }: TableSlot<Users>) => {
              if (record.role === "user") return <Tag color="blue">普通用户</Tag>;
              if (record.role === "dealer") return <Tag color="green">代理商</Tag>;
              if (record.role === "admin") return <Tag color="magenta">管理员</Tag>;
            },
            status: ({ record }: TableSlot<Users>) => {
              if (record.status) return <Tag color="green">启用</Tag>;
              return <Tag color="red">禁用</Tag>;
            },
            actions: ({ record }: TableSlot<Users>) => (
              <div>
                <Popconfirm
                  type="warning"
                  content={`确认要${record.status ? "禁用" : "启用"}该用户吗？`}
                  onOk={() => handleDisableUser(record.id, record.status)}
                >
                  {record.status ? (
                    <Link status="warning">禁用</Link>
                  ) : (
                    <Link status="success">启用</Link>
                  )}
                </Popconfirm>

                <Popconfirm
                  type="error"
                  content="确认要删除该用户吗？"
                  onOk={() => handleDeleteUser(record.id)}
                >
                  <Link status="danger">删除</Link>
                </Popconfirm>
              </div>
            ),
          }}
        />
      </div>
    );
  };

  return render;
});
