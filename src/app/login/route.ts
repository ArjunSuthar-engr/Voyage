import { NextResponse } from "next/server";

export function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/dashboard";

  url.pathname = "/";
  url.search = "";
  url.searchParams.set("auth", "login");
  url.searchParams.set("next", next);

  return NextResponse.redirect(url);
}
