import { prisma } from "@/lib/prisma";
import { chromium } from "playwright";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export async function processProject(projectId: string) {
  let browser;

  try {
    console.log("🟡 Starting ingestion for project:", projectId);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      console.log("❌ Project not found");
      return;
    }

    console.log("🌐 URL:", project.url);

    // ==============================
    // 🔥 1. LAUNCH BROWSER
    // ==============================
    browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(project.url, {
      waitUntil: "networkidle",
    });

    console.log("✅ Page loaded");

    // ==============================
    // 🔥 2. GET HTML
    // ==============================
    const html = await page.content();

    console.log("📄 HTML fetched (first 200 chars):");
    console.log(html.slice(0, 200));

    // ==============================
    // 🔥 3. READABILITY EXTRACTION
    // ==============================
    const dom = new JSDOM(html, {
      url: project.url,
    });

    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      console.log("❌ Readability failed");
    } else {
      console.log("🧠 Article title:", article.title);

      const rawText = article.textContent || "";

      console.log("📏 Raw text length:", rawText.length);

      const cleanedText = rawText
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 50000);

      console.log("🧹 CLEAN TEXT (first 300 chars):");
      console.log(cleanedText.slice(0, 300));

      console.log("📏 Cleaned text length:", cleanedText.length);
    }

    // ==============================
    // 🔥 4. LINK EXTRACTION
    // ==============================
    const links: string[] = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll("a"));

      return anchors
        .map((a) => (a as HTMLAnchorElement).href)
        .filter((href) => {
          if (!href) return false;

          // same domain only
          if (!href.startsWith(window.location.origin)) return false;

          // remove anchors
          if (href.includes("#")) return false;

          return true;
        });
    });

    const uniqueLinks = Array.from(new Set(links));

    console.log("🔗 TOTAL LINKS FOUND:", uniqueLinks.length);

    // ==============================
    // 🔥 5. FILTER DOCS LINKS (NEW STEP)
    // ==============================
    const filteredLinks = uniqueLinks.filter((link) => {
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

    console.log("📄 FILTERED SAMPLE:");
    filteredLinks.slice(0, 20).forEach((link, i) => {
      console.log(`${i + 1}. ${link}`);
    });

    // ==============================
    // 🔥 6. SAVE TO DB (NEW STEP)
    // ==============================
    await prisma.project.update({
      where: { id: projectId },
      data: {
        docsLinks: filteredLinks,
      },
    });

    console.log("💾 Docs links saved to DB");

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