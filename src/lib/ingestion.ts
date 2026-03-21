import { prisma } from "@/lib/prisma";
import { chromium } from "playwright";
import { createEmbedding } from "./embedding";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

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

    console.log("✅ Main page loaded");

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
          if (!item.url.startsWith(window.location.origin)) return false;
          if (item.url.includes("#")) return false;
          if (item.title.length < 2) return false;
          return true;
        });
    });

    console.log("🔗 TOTAL RAW LINKS:", links.length);

    // ==============================
    // 🔥 UNIQUE LINKS
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
    // 🔥 FILTER DOC LINKS
    // ==============================
    const filteredLinks = uniqueLinks.filter((l) => {
      const link = l.url;

      return (
        link.includes("/docs") &&
        !link.includes("blog") &&
        !link.includes("pricing") &&
        !link.includes("github") &&
        !link.includes("twitter")
      );
    });

    console.log("✅ FILTERED LINKS:", filteredLinks.length);

    // ==============================
    // 🔥 TEXT SPLITTER (LangChain)
    // ==============================
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 150,
    });

    // ==============================
    // 🔥 LOOP LINKS → CONTENT → CHUNK → EMBED → SAVE
    // ==============================
    for (const link of filteredLinks.slice(0, 10)) {
      console.log("➡️ Crawling:", link.url);

      try {
        await page.goto(link.url, {
          waitUntil: "networkidle",
        });

        const html = await page.content();

        const dom = new JSDOM(html, { url: link.url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        if (!article) {
          console.log("❌ No content");
          continue;
        }

        const rawText = article.textContent || "";

        if (!rawText || rawText.length < 200) {
          console.log("⚠️ Skipping small content");
          continue;
        }

        const cleanedText = rawText.replace(/\s+/g, " ").trim();

        // 🔥 CHUNKING (LangChain)
        const docs = await splitter.createDocuments([cleanedText]);

        console.log(`📦 Chunks: ${docs.length}`);

        // 🔥 SAVE CHUNKS + EMBEDDING
        for (const doc of docs) {
          const embedding = await createEmbedding(doc.pageContent);

          await prisma.docChunk.create({
            data: {
              content: doc.pageContent,
              embedding,
              url: link.url,
              title: link.title,
              projectId,
            },
          });
        }

        console.log("✅ Saved:", link.title);

      } catch (err) {
        console.log("❌ Error in:", link.url);
      }
    }

    // ==============================
    // 🔥 MARK READY
    // ==============================
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "ready" },
    });

    console.log("🎉 INGESTION COMPLETE");

  } catch (error) {
    console.error("❌ INGESTION_ERROR:", error);
  } finally {
    if (browser) {
      await browser.close();
      console.log("🛑 Browser closed");
    }
  }
}