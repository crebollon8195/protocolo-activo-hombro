import { NextResponse } from "next/server";

// Middleware disabled — route protection is handled in each page component.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
