import { AdminShell } from "../_components/admin-shell";

const categories = [
  ["牛排", "1", "显示"],
  ["主食", "2", "显示"],
  ["汤品", "3", "显示"],
  ["饮料", "4", "显示"],
  ["甜点", "5", "显示"],
  ["沙拉", "6", "显示"],
  ["酱料", "7", "隐藏"],
];

export default function AdminCategoriesPage() {
  return (
    <AdminShell active="categories" eyebrow="/admin/categories" title="分类管理">
      <section className="rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm">
        <div className="flex justify-end">
          <button className="h-11 rounded-xl bg-[#5a210b] px-5 text-sm font-black text-white" type="button">
            新增分类
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-[#eadfd6]">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#f7f2ed] text-[#5b473c]">
              <tr>
                {["分类名称", "图标", "排序", "是否显示", "操作"].map((head) => (
                  <th key={head} className="px-5 py-4 font-black">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eadfd6] bg-white">
              {categories.map(([name, sortOrder, status]) => (
                <tr key={name}>
                  <td className="px-5 py-5 font-black">{name}</td>
                  <td className="px-5 py-5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbf0e6] text-xs font-black text-[#8b3a14]">
                      {name.slice(0, 1)}
                    </span>
                  </td>
                  <td className="px-5 py-5">{sortOrder}</td>
                  <td className="px-5 py-5">
                    <span className={`rounded-full px-3 py-1 font-bold ${status === "显示" ? "bg-[#e8f4ea] text-[#258544]" : "bg-[#ffe8e5] text-[#d43b2f]"}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex gap-2">
                      <button className="rounded-lg border border-[#ead8c8] px-4 py-2 text-xs font-bold" type="button">编辑</button>
                      <button className="rounded-lg border border-[#ead8c8] px-4 py-2 text-xs font-bold" type="button">
                        {status === "显示" ? "隐藏" : "显示"}
                      </button>
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
