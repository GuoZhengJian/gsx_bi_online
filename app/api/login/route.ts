import { NextRequest, NextResponse } from "next/server";
import users from "../../../config/sign_in.json";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const account = (body.account ?? "").trim();
    const password = (body.password ?? "").trim();

    if (!account || !password) {
      return NextResponse.json(
        { success: false, message: "账号和密码不能为空" },
        { status: 400 },
      );
    }

    const user = (users as any[]).find((u) => u.account === account);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "账号不存在" },
        { status: 401 },
      );
    }

    const storedPassword = user.password;

    if (storedPassword !== password) {
      return NextResponse.json(
        { success: false, message: "密码错误" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { success: true, message: "登录成功" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "服务器错误，请稍后重试" },
      { status: 500 },
    );
  }
}

