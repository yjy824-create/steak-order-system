# Cloudinary 图片上传设置

本项目后台商品管理页使用 Cloudinary unsigned upload 上传商品图片，并把取得的 `secure_url` 保存到 Firestore `products.imageUrl`。

## 1. Cloudinary 注册步骤

1. 前往 Cloudinary 官网注册免费账号。
2. 登录 Cloudinary Console。
3. 在 Dashboard 找到 Cloud name。
4. Cloud name 会作为前端上传 API 的路径参数。

## 2. 建立 Upload Preset

1. 进入 Cloudinary Console。
2. 打开 Settings。
3. 进入 Upload 页面。
4. 找到 Upload presets。
5. 新增一个 preset。
6. Signing Mode 选择 Unsigned。
7. 记录 preset 名称。
8. 建议限制允许上传的格式为 `jpg`、`jpeg`、`png`、`webp`。
9. 如有需要，可设置 Folder，例如 `steak-order-system/products`。

注意：unsigned upload preset 是公开上传入口，请只用于 MVP 或受后台页面保护的上传流程。正式上线前建议加上更严格的上传限制。

## 3. 环境变量

本机 `.env.local` 与 Vercel 都需要设置：

```text
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

字段说明：

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`：Cloudinary Dashboard 显示的 Cloud name。
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`：Cloudinary Upload preset 名称。

## 4. Vercel 配置

1. 打开 Vercel Project Settings。
2. 进入 Environment Variables。
3. 新增 `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`。
4. 新增 `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`。
5. Environment 请选择 Production、Preview、Development。
6. 保存后重新部署 Production。

如果 Vercel 已经部署过，但页面仍提示环境变量未配置，请重新执行 Production redeploy。

## 5. 常见错误排查

### 环境变量未配置

页面会显示：

```text
Cloudinary 环境变量未配置：NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
```

请确认 `.env.local` 或 Vercel Environment Variables 已填写，并重新启动开发服务器或重新部署。

### Upload preset 不存在

Cloudinary 可能返回 preset 相关错误。请确认 preset 名称完全一致，并且已经设置为 Unsigned。

### 上传被拒绝

请检查 Upload preset 的限制，例如允许格式、档案大小、folder 权限或账号额度。

### 图片超过 5MB

后台页面会显示：

```text
图片不能超过 5MB
```

请压缩图片后再上传。

### 图片格式不支持

后台页面会显示：

```text
仅支持 jpg、jpeg、png、webp
```

请改用支持的图片格式。

### Firestore 没有更新 imageUrl

Cloudinary 上传成功只会先把 `secure_url` 自动填入表单的 `imageUrl`。还需要点击「新增商品」或「保存修改」，才会写入 Firestore `products.imageUrl`。
