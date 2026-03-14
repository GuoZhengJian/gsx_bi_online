import { NextRequest, NextResponse } from "next/server";
import config from "../../../config/sign_in.json";

const signInConfig = config as {
  powerbi_tenant_id: string;
  powerbi_client_id: string;
  users: Record<string, unknown>[];
};
const users = signInConfig.users;

/**
 * 使用 ROPC 获取 Azure AD 访问令牌
 */
async function getAzureAccessToken(
  tenantId: string,
  clientId: string,
  username: string,
  password: string,
): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: clientId,
    username,
    password,
    scope: "https://analysis.windows.net/powerbi/api/.default",
  });

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Azure AD token failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * 使用 Azure 令牌向 Power BI 申请报表嵌入令牌
 */
async function getPowerBiEmbedToken(
  accessToken: string,
  workspaceId: string,
  reportId: string,
): Promise<{ token: string; embedUrl: string }> {
  const res = await fetch(
    `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessLevel: "View" }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Power BI GenerateToken failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  const embedUrl = `https://app.powerbi.com/reportEmbed?reportId=${reportId}`;
  return { token: data.token, embedUrl };
}

export async function GET(request: NextRequest) {
  const POWERBI_TENANT_ID = signInConfig.powerbi_tenant_id;
  const POWERBI_CLIENT_ID = signInConfig.powerbi_client_id;

  if (!POWERBI_TENANT_ID || !POWERBI_CLIENT_ID) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Power BI 未配置（请在 config/sign_in.json 中配置 powerbi_tenant_id、powerbi_client_id）",
      },
      { status: 500 },
    );
  }

  const accountParam = request.nextUrl.searchParams.get("account");
  const account =
    typeof accountParam === "string" ? accountParam.trim() : null;

  if (!account) {
    return NextResponse.json(
      { success: false, message: "缺少参数 account" },
      { status: 400 },
    );
  }

  const user = users.find(
    (u) => u.account === account,
  );
  if (!user) {
    return NextResponse.json(
      { success: false, message: "未找到该账号" },
      { status: 404 },
    );
  }

  const username = user.powerbi_username as string | undefined;
  const password = user.powerbi_password as string | undefined;
  const reportId = user.powerbi_report_id as string | undefined;
  const workspaceId = user.powerbi_workspace_id as string | undefined;

  if (!username || !password || !reportId || !workspaceId) {
    return NextResponse.json(
      {
        success: false,
        message: `账号 ${account} 未配置 Power BI 信息（powerbi_username、powerbi_password、powerbi_report_id、powerbi_workspace_id）`,
      },
      { status: 400 },
    );
  }

  try {
    const accessToken = await getAzureAccessToken(
      POWERBI_TENANT_ID,
      POWERBI_CLIENT_ID,
      username,
      password,
    );
    const { token, embedUrl } = await getPowerBiEmbedToken(
      accessToken,
      workspaceId,
      reportId,
    );

    return NextResponse.json({
      success: true,
      accessToken: token,
      embedUrl,
      reportId,
    });
  } catch (error) {
    console.error("Power BI embed token error:", error);
    const message =
      error instanceof Error ? error.message : "获取嵌入令牌失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 },
    );
  }
}
