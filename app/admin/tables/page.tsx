import { AdminShell } from "../_components/admin-shell";
import { tableNumbers } from "../../_utils/tables";

const productionOrigin = "https://steak-order-system.vercel.app";

export default function AdminTablesPage() {
  return (
    <AdminShell active="tables" eyebrow="/admin/tables" title="桌号二维码链接">
      <section className="rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-5 border-b border-[#eadfd6] pb-5">
          <div>
            <h2 className="text-xl font-black text-[#241108]">桌号点餐链接</h2>
            <p className="mt-2 text-sm font-semibold text-[#8b7565]">
              目前先提供链接列表，后续再加入 QRCode 生成。将链接做成二维码后贴在桌面即可。
            </p>
          </div>
          <span className="rounded-full bg-[#fff0df] px-4 py-2 text-sm font-black text-[#8b3a14]">
            {tableNumbers.length} 桌
          </span>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {tableNumbers.map((tableNumber) => {
            const menuUrl = `${productionOrigin}/menu?table=${encodeURIComponent(
              tableNumber,
            )}`;

            return (
              <article
                className="rounded-2xl border border-[#eadfd6] bg-[#fffaf5] p-5"
                key={tableNumber}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5a210b] text-xl font-black text-white">
                    {tableNumber}
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#8b7565]">
                    菜单入口
                  </span>
                </div>
                <p className="mt-4 break-all rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#5a210b]">
                  {menuUrl}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}
