import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  authenticateUser,
  createSession,
  createUser,
  logout,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  action: z.literal("signup"),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  institutionId: z.string().min(1),
});

const loginSchema = z.object({
  action: z.literal("login"),
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === "signup") {
      const parsed = signupSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: "Invalid signup details." },
          { status: 400 }
        );
      }

      const issuer = await prisma.issuer.findUnique({
        where: { id: parsed.data.institutionId },
      });

      if (!issuer) {
        return NextResponse.json(
          { success: false, error: "Institution not found." },
          { status: 400 }
        );
      }

      const user = await createUser({
        ...parsed.data,
        issuerId: issuer.id,
      });
      await createSession(user.id);

      return NextResponse.json(
        { success: true, user: publicUser(user) },
        { status: 201 }
      );
    }

    if (body.action === "login") {
      const parsed = loginSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: "Invalid login details." },
          { status: 400 }
        );
      }

      const user = await authenticateUser(parsed.data.email, parsed.data.password);
      await createSession(user.id);

      return NextResponse.json({ success: true, user: publicUser(user) });
    }

    if (body.action === "logout") {
      if (!z.object({ action: z.literal("logout") }).safeParse(body).success) {
        return NextResponse.json(
          { success: false, error: "Invalid logout request." },
          { status: 400 }
        );
      }

      await logout();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Unsupported authentication action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Authentication error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed.",
      },
      { status: 400 }
    );
  }
}

function publicUser(user: { id: string; name: string; email: string; role: string }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}