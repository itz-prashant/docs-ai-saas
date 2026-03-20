import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { projectId, content } = body;

    if (!projectId || !content) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // check project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content,
        role: "user",
        projectId,
      },
    });

    return NextResponse.json(message);
  } catch (error: unknown) {
    console.error("MESSAGE_CREATE_ERROR:", error);

    let message = "Internal Server Error";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "ProjectId required" },
        { status: 400 }
      );
    }

    // verify ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error: unknown) {
    console.error("MESSAGE_FETCH_ERROR:", error);

    let message = "Internal Server Error";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}