import { AdminShell } from "../_components/admin-shell";

const products = [
  ["经典沙朗牛排", "牛排", "$320", "上架中", "是"],
  ["菲力牛排", "牛排", "$450", "上架中", "是"],
  ["丁骨牛排", "牛排", "$520", "上架中", "否"],
  ["奶油玉米浓汤", "汤品", "$80", "上架中", "否"],
  ["番茄肉酱意面", "主食", "$160", "上架中", "否"],
  ["可乐", "饮料", "$30", "上架中", "否"],
  ["柠檬红茶", "饮料", "$40", "已售完", "否"],
];

export default function AdminProductsPage() {
  return (
    <AdminShell active="products" eyebrow="/admin/products" title="商品管理">
      <section className="rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm">
        <div className="grid grid-cols-[1fr_12rem_auto_auto] gap-3">
          <input className="h-11 rounded-xl border border-[#ead8c8] px-4 text-sm outline-none" placeholder="搜索商品名称" />
          <select className="h-11 rounded-xl border border-[#ead8c8] px-4 text-sm outline-none" defaultValue="全部分类">
            <option>全部分类</option>
          </select>
          <button className="h-11 rounded-xl border border-[#ead8c8] px-5 text-sm font-black" type="button">筛选</button>
          <button className="h-11 rounded-xl bg-[#5a210b] px-5 text-sm font-black text-white" type="button">新增商品</button>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-[#eadfd6]">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#f7f2ed] text-[#5b473c]">
              <tr>
                {["商品图片", "商品名称", "分类", "价格", "是否上架", "是否推荐", "操作"].map((head) => (
                  <th key={head} className="px-4 py-4 font-black">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eadfd6] bg-white">
              {products.map(([name, category, price, available, recommended]) => (
                <tr key={name}>
                  <td className="px-4 py-3">
                    <div className="h-12 w-16 rounded-xl bg-[linear-gradient(145deg,#8b3515,#2a1208)]" />
                  </td>
                  <td className="px-4 py-3 font-black">{name}</td>
                  <td className="px-4 py-3">{category}</td>
                  <td className="px-4 py-3 font-black">{price}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 font-bold ${available === "上架中" ? "bg-[#e8f4ea] text-[#258544]" : "bg-[#f2f0ee] text-[#7b6355]"}`}>
                      {available}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-lg text-[#f29a1f]">{recommended === "是" ? "★" : "☆"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="rounded-lg border border-[#ead8c8] px-4 py-2 text-xs font-bold" type="button">编辑</button>
                      <button className="rounded-lg border border-[#ffd0c9] px-4 py-2 text-xs font-bold text-[#d43b2f]" type="button">下架</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
