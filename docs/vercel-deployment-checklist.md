# Vercel Deployment Checklist

本文件用于牛排店点餐系统 MVP 部署到 Vercel 前后的检查。

## 1. 部署前状态确认

- GitHub `main` 分支已更新到最新版本。
- `npm run lint` 已通过。
- `npm run build` 已通过。
- Firebase SDK 已安装。
- Firestore Database 已启用。
- Firestore `categories`、`products`、`orders` 已可读写。
- `.env.local` 没有提交到 GitHub。

## 2. Vercel 项目设置

- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: 留空，使用 Next.js 默认设置。

## 3. Vercel 环境变量

请在 Vercel Project Settings -> Environment Variables 加入以下变量：

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

这些值要和本机 `.env.local` 一致。不要把 `.env.local` 上传到 GitHub。

## 4. Firebase Rules 注意事项

当前开发阶段的 Firestore Rules 可能对以下 collection 开放读写：

- `firebase_test`
- `orders`
- `products`
- `categories`

上线前风险：

- `allow read, write: if true` 不安全。
- MVP 测试阶段可以临时使用开放规则。
- 正式上线前必须接 Firebase Auth，或至少增加后台保护。

## 5. 部署后测试路径

部署成功后请逐一打开：

- `/`
- `/menu`
- `/cart`
- `/order-success`
- `/order-status`
- `/admin`
- `/admin/orders`
- `/admin/products`
- `/admin/categories`
- `/admin/kitchen`
- `/admin/firebase-test`

## 6. 部署后测试流程

- 打开 `/menu`。
- 加入商品到购物车。
- 送出订单。
- 确认 Firestore `orders` 是否出现新订单。
- 确认 `/admin/orders` 是否实时出现订单。
- 确认 `/admin/kitchen` 是否出现订单。
- 在厨房页面修改订单状态。
- 确认 `/order-status` 是否同步更新。

## 7. 常见问题

### Vercel build 失败

- 确认本机 `npm run build` 是否通过。
- 检查 Vercel Build Logs 中的 TypeScript 或 ESLint 错误。
- 确认没有依赖本机才存在的文件。

### Firebase env missing

- 确认 Vercel 环境变量名称完全正确。
- 确认变量已加入 Production 环境。
- 修改变量后需要重新部署。

### Firestore permission-denied

- 检查 Firebase Rules 是否允许当前操作。
- 确认前台订单写入 `orders` 的权限。
- 确认后台商品、分类、订单管理所需权限。

### 图片无法显示

- 确认 `products.imageUrl` 是公开可访问 URL。
- 确认图片来源没有防盗链或授权限制。
- 前台会在 `imageUrl` 为空时显示占位图块。

### Hydration error

- 检查是否在 Server Component 中直接读取浏览器专属 API。
- 使用 `use client` 的页面要避免初始渲染内容和客户端状态不一致。

### `.env.local` 被误提交

- 立即从 Git 历史和远端仓库移除敏感资料。
- 旋转 Firebase Web App API key 或相关凭证。
- 确认 `.gitignore` 包含 `.env` 与 `.env.local`。

## 8. 下一阶段建议

- Firebase Auth / admin login。
- 收紧 Firestore Rules。
- 店铺设置页面。
- 商品图片上传。
- 订单打印。
- Vercel 正式域名。
