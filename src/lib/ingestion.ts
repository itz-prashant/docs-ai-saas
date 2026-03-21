import { prisma } from "@/lib/prisma";
import { chromium } from "playwright";
import { createEmbedding } from "./embedding";

export async function processProject(projectId: string) {
  let browser;

  try {
    console.log("🟡 Starting ingestion for project:", projectId);

    // ==============================
    // 🔥 GET PROJECT
    // ==============================
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      console.log("❌ Project not found");
      return;
    }

    console.log("🌐 URL:", project.url);

    // 🔥 mark processing
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "processing" },
    });

    // ==============================
    // 🔥 LAUNCH BROWSER
    // ==============================
    browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(project.url, {
      waitUntil: "networkidle",
    });

    console.log("✅ Page loaded");

    // ==============================
    // 🔥 EXTRACT LINKS + TITLES
    // ==============================
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll("a"));

      return anchors
        .map((a) => {
          const el = a as HTMLAnchorElement;

          return {
            url: el.href,
            title: el.innerText?.trim(),
          };
        })
        .filter((item) => {
          if (!item.url || !item.title) return false;

          // same domain only
          if (!item.url.startsWith(window.location.origin)) return false;

          // remove anchors (#)
          if (item.url.includes("#")) return false;

          // remove useless small text
          if (item.title.length < 2) return false;

          return true;
        });
    });

    console.log("🔗 TOTAL RAW LINKS:", links.length);

    // ==============================
    // 🔥 REMOVE DUPLICATES
    // ==============================
    const uniqueMap = new Map<string, string>();

    links.forEach((l) => {
      if (!uniqueMap.has(l.url)) {
        uniqueMap.set(l.url, l.title);
      }
    });

    const uniqueLinks = Array.from(uniqueMap.entries()).map(
      ([url, title]) => ({
        url,
        title,
      })
    );

    console.log("🔗 UNIQUE LINKS:", uniqueLinks.length);

    // ==============================
    // 🔥 FILTER DOCS LINKS
    // ==============================
    const filteredLinks = uniqueLinks.filter((l) => {
      const link = l.url;

      return (
        link.includes("/docs") &&
        !link.includes("blog") &&
        !link.includes("pricing") &&
        !link.includes("sponsor") &&
        !link.includes("github") &&
        !link.includes("twitter") &&
        !link.includes("discord")
      );
    });

    console.log("✅ FILTERED DOC LINKS:", filteredLinks.length);

    console.log("📄 SAMPLE:");
    filteredLinks.slice(0, 20).forEach((l, i) => {
      console.log(`${i + 1}. ${l.title} → ${l.url}`);
    });

    // ==============================
    // 🔥 SAVE TO DB (IMPORTANT FIX)
    // ==============================
    for (const link of filteredLinks) {
      await prisma.docLink.create({
        data: {
          projectId: project.id,
          url: link.url,
          title: link.title,
        },
      });
    }

    console.log("💾 Links saved to DocLink table");

    const docs = await prisma.docLink.findMany({
  where: { projectId: project.id },
});

    // ==============================
    // 🔥 MARK READY
    // ==============================
console.log("🧠 Creating embeddings...");

for (const doc of docs) {
  const embedding = await createEmbedding(doc.title);

  await prisma.docLink.update({
    where: { id: doc.id },
    data: {
      embedding,
    },
  });

  console.log("✅ Embedded:", doc.title.slice(0, 20));
}

    // ==============================
    // 🔥 MARK READY
    // ==============================
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "ready" },
    });

    console.log("✅ Extraction complete");

  } catch (error) {
    console.error("❌ INGESTION_ERROR:", error);
  } finally {
    if (browser) {
      await browser.close();
      console.log("🛑 Browser closed");
    }
  }
}