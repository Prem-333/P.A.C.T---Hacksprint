/**
 * @module api/auth
 * @description Login endpoint with updated role credentials.
 * POST /api/auth — Login
 * DELETE /api/auth — Logout
 */

import { NextRequest, NextResponse } from "next/server";
import { USERS } from "@/lib/server/wallet";

const SESSION_COOKIE = "pbr_session";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const user = USERS[username.toLowerCase()];

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create session token
    const sessionData = {
      username: user.username,
      name: user.name,
      role: user.role,
      address: user.address,
      description: user.description,
      loginAt: Date.now(),
    };
    const token = Buffer.from(JSON.stringify(sessionData)).toString("base64");

    const response = NextResponse.json({
      success: true,
      user: {
        username: user.username,
        name: user.name,
        role: user.role,
        address: user.address,
        description: user.description,
      },
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
