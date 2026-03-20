import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { title, url } = body;

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and URL required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title,
        url,
        userId: session.user.id,
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    console.error("PROJECT_CREATE_ERROR:", error);

    let message = "Internal Server Error";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
