# Power BI 免登录嵌入报表 — 技术方案与实施指南

本文档说明在本站实现「用户登录后免登录查看同一份 Power BI 在线报表」所采用的技术方案、官方文档引用、项目引用方式及配置方法。

---

## 一、技术方案文档引用

本方案基于 Microsoft 官方「面向客户的嵌入」（Embed for your customers）能力实现，相关文档如下：

| 主题 | 链接 |
|------|------|
| 使用场景说明：Embed for your customers | [Power BI usage scenarios: Embed for your customers](https://learn.microsoft.com/en-us/power-bi/guidance/powerbi-implementation-planning-usage-scenario-embed-for-your-customers) |
| 嵌入应用设置与注册 | [Set up Power BI Embedded、Register app](https://learn.microsoft.com/en-us/power-bi/developer/embedded/register-app?tabs=customers) |
| 嵌入令牌与权限 | [Permission tokens needed to embed - Embed tokens](https://learn.microsoft.com/en-us/power-bi/developer/embedded/embed-tokens) |
| 生成嵌入令牌 | [Generate an embed token in Power BI embedded analytics](https://learn.microsoft.com/en-us/power-bi/developer/embedded/generate-embed-token) |
| REST API：工作区报表 GenerateToken | [Reports GenerateTokenInGroup](https://learn.microsoft.com/en-us/rest/api/power-bi/embed-token/reports-generate-token-in-group) |
| 前端嵌入与配置 | [Configure report settings、Embed a report](https://learn.microsoft.com/en-us/javascript/api/overview/powerbi/configure-report-settings) |
| Power BI 嵌入分析总览 | [Embedding in Power BI](https://learn.microsoft.com/zh-cn/power-bi/developer/embedded/embedding) |

---

## 二、技术方案解决的问题

- **问题**：若在页面里用 iframe 直接打开 Power BI 报表链接，会要求用户登录 Power BI；访客没有 Power BI 账号或不想再登录一次，无法在站内直接看报表。
- **本方案**：由**后端**使用一套固定的 Power BI 主账号换取「嵌入令牌」（Embed Token），**前端**仅用该令牌通过 Power BI 嵌入 SDK 渲染报表。访客只需完成本站登录，即可在门户页看到报表，**无需输入或拥有 Power BI 账号密码**，也无需在 iframe 中再登录一次。

---

## 三、功能介绍与实现原理

### 3.1 功能介绍

- 用户在本站首页完成账号密码登录后，跳转到门户页（如 `/portal?account=xxx`）。
- 门户页校验账号后，在同一页面内嵌入一份 Power BI 报表；报表以「查看」方式展示，支持筛选、翻页等交互。
- 报表的访问身份由**后端使用的 Power BI 主账号**决定，终端用户不接触、不输入 Power BI 凭证；所有已通过本站鉴权的用户看到的是**同一份报表**（同一 reportId，同一工作区）。

### 3.2 实现原理

1. **身份与令牌**  
   采用 Power BI「面向客户的嵌入」模式：应用使用**主用户**（Master User，即固定的 Power BI 账号）或服务主体访问 Power BI。本项目使用主用户 + 用户名密码，通过 Azure AD 的 **ROPC（Resource Owner Password Credentials）** 换取访问 Power BI 的 Access Token。

2. **嵌入令牌**  
   后端持 Access Token 调用 Power BI REST API：  
   `POST /v1.0/myorg/groups/{workspaceId}/reports/{reportId}/GenerateToken`  
   请求体为 `{ "accessLevel": "View" }`，获取该报表的 **Embed Token** 与 **embedUrl**。

3. **前端渲染**  
   前端请求本站接口（如 `GET /api/powerbi-embed`）获取 `accessToken`、`embedUrl`、`reportId`，使用 **powerbi-client** 的 `embed(container, config)` 在指定 DOM 容器中渲染报表；浏览器中加载的是 Power BI 的 iframe，但身份已由 Embed Token 提供，故无需用户再登录。

4. **数据流简述**  
   `用户访问门户页` → `前端请求 /api/powerbi-embed` → `后端 ROPC 换 Azure AD Token` → `后端用 Token 调 GenerateToken` → `后端返回 Embed Token 与 embedUrl` → `前端 powerbi.embed()` 渲染报表`。

---

## 四、项目如何引用

### 4.1 依赖

- 已安装 **powerbi-client**（Power BI 官方前端嵌入库），用于在浏览器中嵌入报表。

### 4.2 代码引用关系

| 位置 | 作用 |
|------|------|
| `app/api/powerbi-embed/route.ts` | 提供 `GET /api/powerbi-embed`：执行 ROPC、调用 GenerateToken，返回 `accessToken`、`embedUrl`、`reportId`。 |
| `app/portal/PowerBiEmbed.tsx` | 客户端组件：请求 `/api/powerbi-embed`，用返回结果构造 `IReportEmbedConfiguration`，调用 `powerbi.embed(container, config)` 渲染报表；卸载时调用 `service.reset(container)` 清理。 |
| `app/portal/page.tsx` | 门户页：根据 URL 参数校验账号（如 `account`），通过则渲染 `<PowerBiEmbed />`，否则展示未授权或错误提示。 |

### 4.3 使用方式

- 用户登录成功后跳转到 `/portal?account=xxx`。
- 门户页加载后，`PowerBiEmbed` 会主动请求 `/api/powerbi-embed` 并渲染报表，无需在业务代码中再传 Power BI 凭证或手动调用嵌入 API。

---

## 五、相关内容如何配置

### 5.1 环境变量（必配）

在项目根目录创建 **`.env.local`**（勿提交到 Git），并配置：

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `POWERBI_TENANT_ID` | Azure AD 租户 ID | 应用注册 → 目录(租户) ID |
| `POWERBI_CLIENT_ID` | Azure AD 应用客户端 ID | 应用注册 → 应用程序(客户端) ID |
| `POWERBI_USERNAME` | Power BI 主账号邮箱 | 用于 ROPC 的 Power BI 账号 |
| `POWERBI_PASSWORD` | Power BI 主账号密码 | 同上 |
| `POWERBI_REPORT_ID` | 报表 ID | 报表 URL 中 `reports/` 后第一段 GUID |
| `POWERBI_WORKSPACE_ID` | 工作区 ID | 报表 URL 中 `groups/` 后第一段 GUID |

示例（需替换为实际值）：

```env
POWERBI_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
POWERBI_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
POWERBI_USERNAME=your-account@your-tenant.onmicrosoft.com
POWERBI_PASSWORD=your-password
POWERBI_REPORT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
POWERBI_WORKSPACE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

可参考仓库中的 **`.env.example`**。

### 5.2 Azure AD 应用注册与权限

1. **注册应用**  
   Microsoft Entra 管理中心 → 应用注册 → 新注册。名称自定，支持的账户类型选「仅此组织目录中的账户」，重定向 URI 可留空。记录 **应用程序(客户端) ID**、**目录(租户) ID**。

2. **API 权限**  
   在该应用 → API 权限 → 添加权限 → Microsoft API → **Power BI 服务**，勾选委托权限：  
   - **Report.Read.All**  
   - **Dataset.Read.All**  
   添加后对该应用**授予管理员同意**。

3. **允许公共客户端流（ROPC 需要）**  
   同一应用 → 身份验证（Authentication）→ 高级设置 → **允许公共客户端流** 设为 **是**，保存。

### 5.3 Power BI 侧要求

- **工作区**：报表必须发布在**工作区**（Group/Workspace）中，不能仅在「我的工作区」；否则 GenerateToken 会返回 `Embedding isn't supported for non-group workspace`。
- **获取 ID**：在工作区中打开报表，从地址栏 URL 取 `groups/` 后第一段 GUID 为 `POWERBI_WORKSPACE_ID`，`reports/` 后第一段 GUID 为 `POWERBI_REPORT_ID`。

示例 URL：  
`https://app.powerbi.com/groups/04546ab8-62b4-42a8-83cb-0aba2bbe34f6/reports/f554db6c-b635-46d5-9d39-b4d04d89ca60/...`  
→ 工作区 ID：`04546ab8-62b4-42a8-83cb-0aba2bbe34f6`，报表 ID：`f554db6c-b635-46d5-9d39-b4d04d89ca60`。

### 5.4 常见问题与处理

| 现象 | 原因 | 处理 |
|------|------|------|
| GenerateToken 返回 403，提示 non-group workspace | 报表在「我的工作区」 | 将报表移到工作区，并配置 `POWERBI_WORKSPACE_ID` |
| GenerateToken 返回 403，提示 Report.Read.All / Dataset.Read.All | 缺少数据集权限 | 在 Azure 应用中添加 **Dataset.Read.All** 并授予管理员同意 |
| 前端报错 already has embedded component | 同一容器被重复嵌入未清理 | 在组件卸载时调用 `service.reset(container)`（本项目已实现） |
| 嵌入报表顶部出现「免费试用版」黄色横幅 | 工作区使用试用容量，无法通过 API 关闭 | 购买并分配专用容量可去除；或在前端用 CSS 裁掉顶部约 40～48px（本项目通过 `TRIAL_BANNER_HEIGHT` 控制） |
| 容量/试用容量设置找不到 | 容量在管理门户中配置 | Power BI 右上角 设置 → 治理和管理 → **管理门户** → 左侧 **容量设置**（需管理员权限） |

### 5.5 安全与维护

- `POWERBI_USERNAME`、`POWERBI_PASSWORD` 仅放在服务端环境变量，不要写进前端或提交仓库。
- 若 Power BI 主账号密码变更，需同步更新 `.env.local`。
- 生产环境建议评估使用服务主体 + 客户端密钥等更安全方式替代 ROPC；Embed Token 由后端按需生成，前端不持久化。

---

*文档与当前项目实现保持一致，便于后续维护与交接。*
