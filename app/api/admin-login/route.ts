import { NextResponse } from "next/server";

type LoginRequestBody = {
  password?: string;
  username?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginRequestBody;
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return NextResponse.json(
      { message: "Admin credentials are not configured." },
      { status: 500 },
    );
  }

  if (body.username !== adminUsername || body.password !== adminPassword) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_logged_in", "true", {
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
