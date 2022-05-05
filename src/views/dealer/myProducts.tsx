import {
  GoodsCreateGoods,
  GoodsDeleteGoods,
  GoodsGetGoods,
  GoodsUpdateGoods,
} from "@/api/controllers/GoodsController";
import usePagination from "@/hooks/usePagination";
import useUserStore from "@/store/useUser";
import { TableSlot } from "@/types";
import { toGB } from "@/utils/tools";
import {
  Button,
  Col,
  Form,
  FormItem,
  Input,
  InputNumber,
  Link,
  Message,
  Modal,
  Option,
  Popconfirm,
  Row,
  Select,
  Table,
  TableColumnData,
  Tag,
} from "@arco-design/web-vue";
import { Goods } from "@prisma/client";
import _ from "lodash";
import { storeToRefs } from "pinia";
import { defineComponent, nextTick, reactive, ref } from "vue";

export default defineComponent(() => {
  const { isAdmin } = storeToRefs(useUserStore());
  const { dataList, pagination, loading, onChange, reload } =
    usePagination<Goods>(GoodsGetGoods);

  const formRef = ref();
  const formModal = ref(false);
  const formEdit = ref(false);
  const formData = reactive({
    name: "",
    sku: "",
    price: "0.00",
    traffic: 0,
    days: 0,
    status: 1,
  });

  const handleCreateGoods = (done: Function) => {
    (async () => {
      loading.value = true;
      const res = await GoodsCreateGoods(formData);
      if (!res) return done(false);
      await reload();
      Message.success("添加商品成功");
      done();
      loading.value = false;
    })();
  };

  const handleUpdateGoods = (done: Function) => {
    (async () => {
      loading.value = true;
      const res = await GoodsUpdateGoods(formData);
      if (!res) return done(false);
      await reload();
      Message.success("编辑商品成功");
      done();
      loading.value = false;
    })();
  };

  const handleDeleteGoods = async (id: number) => {
    loading.value = true;
    const res = await GoodsDeleteGoods({ id });
    if (!res) return;
    await reload();
    Message.success("删除商品成功");
    loading.value = false;
  };

  const columns: Array<TableColumnData> = [
    { title: "ID", dataIndex: "id", ellipsis: true, width: 70 },
    { title: "商品名称", dataIndex: "name", ellipsis: true },
    { title: "商品SKU", dataIndex: "sku", ellipsis: true, align: "center" },
    { title: "价格", slotName: "price", ellipsis: true, align: "center" },
    { title: "可用流量", slotName: "traffic", ellipsis: true, align: "center" },
    { title: "有效天数", slotName: "days", align: "center" },
    { title: "状态", slotName: "status", align: "center" },
  ];
  if (isAdmin.value) {
    columns.push({ title: "操作", slotName: "actions", align: "center", width: 170 });
  }

  const render = () => {
    return (
      <div>
        <Button
          type="primary"
          onClick={() => {
            formModal.value = true;
            formEdit.value = false;
          }}
        >
          添加商品
        </Button>
        <div class="table__card">
          <Table
            columns={columns}
            data={dataList.value}
            loading={loading.value}
            pagination={pagination}
            onPageSizeChange={onChange.pageSize}
            onPageChange={onChange.current}
            v-slots={{
              price: ({ record }: TableSlot<Goods>) => `${record.price} ¥`,
              traffic: ({ record }: TableSlot<Goods>) => `${record.traffic} GB`,
              days: ({ record }: TableSlot<Goods>) => `${record.days}天`,
              status: ({ record }: TableSlot<Goods>) => {
                if (record.status) return <Tag color="green">上架中</Tag>;
                return <Tag color="red">已下架</Tag>;
              },
              actions: ({ record }: TableSlot<Goods>) => (
                <div>
                  <Link
                    onClick={() => {
                      formModal.value = true;
                      formEdit.value = true;
                      nextTick(() => _.assign(formData, record));
                    }}
                  >
                    编辑
                  </Link>

                  <Popconfirm
                    type="warning"
                    content="确认要删除该商品吗？"
                    onOk={() => handleDeleteGoods(record.id)}
                  >
                    <Link status="danger">删除</Link>
                  </Popconfirm>
                </div>
              ),
            }}
          />
        </div>

        <Modal
          v-model:visible={formModal.value}
          width={500}
          title="添加商品"
          onBeforeOk={formEdit.value ? handleUpdateGoods : handleCreateGoods}
          onBeforeClose={() => formRef.value.resetFields()}
        >
          <Form model={formData} layout="vertical" ref={formRef}>
            <Row gutter={16}>
              <Col span={8}>
                <FormItem label="商品名称" field="name">
                  <Input v-model={formData.name} placeholder="小鱼包" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="商品SKU" field="sku">
                  <Input v-model={formData.sku} placeholder="000000" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="价格" field="price">
                  <Input
                    v-model={formData.price}
                    placeholder="0.00"
                    v-slots={{ append: () => "元" }}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <FormItem label="可用流量" field="traffic">
                  <InputNumber
                    v-model={formData.traffic}
                    placeholder="0"
                    v-slots={{ append: () => "GB" }}
                    hideButton
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="有效天数" field="days">
                  <InputNumber
                    v-model={formData.days}
                    placeholder="0"
                    v-slots={{ append: () => "天" }}
                    hideButton
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="状态" field="status">
                  <Select v-model={formData.status}>
                    <Option value={1}>上架售卖</Option>
                    <Option value={0}>下架暂停</Option>
                  </Select>
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  };

  return render;
});
