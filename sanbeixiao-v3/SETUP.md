# 三倍笑 V3 · CloudBase 一次性设置

顾客页面仍放在 GitHub Pages，商品资料和照片放在腾讯 CloudBase。

## 1. 创建 CloudBase 环境

在腾讯云 CloudBase 创建一个环境，建议使用上海地域。记下环境 ID。

## 2. 身份认证

开启：
- 匿名登录（顾客只读）
- 用户名密码登录（管理员发布）

在用户管理中新建一个管理员，例如：
- 用户名：`sanbeixiao-admin`
- 设置一个符合 CloudBase 要求的强密码

## 3. Web 安全域名

把 `shinnan.github.io` 加到 CloudBase 的 Web 安全域名列表。

## 4. 数据库

创建文档型数据库集合：`catalog`

安全规则：

```json
{
  "read": true,
  "write": "auth != null && auth.loginType != 'ANONYMOUS'"
}
```

网站会使用文档 ID `current` 保存整个商品目录。

## 5. 云存储

将云存储安全规则设置为：

```json
{
  "read": true,
  "write": "auth != null && auth.loginType != 'ANONYMOUS'"
}
```

商品图片会保存到 `products/` 目录。

## 6. 填写环境 ID

将 `config.js` 改成：

```js
window.SANBEIXIAO_CLOUDBASE = {
  env: "你的环境ID",
  region: "ap-shanghai"
};
```

然后访问：

`https://shinnan.github.io/EsAT/sanbeixiao-v3/`

管理员使用页面右上角“管理”，本地管理密码默认是 `19930115`。第一次发布时再登录一次 CloudBase 管理员账号。之后直接“保存并发布”，顾客刷新同一个网页即可看到新商品。
