import { prisma } from "@/lib/prisma";
import { createEmbedding } from "@/lib/embedding";
import { cosineSimilarity } from "@/lib/similarity";

export async function searchDocs(query: string, projectId: string) {
  console.log("🔍 User query:", query);

  // 🔥 1. query embedding
  const queryEmbedding = await createEmbedding(query);

  console.log("🧠 Query embedding created");

  // 🔥 2. fetch all docs
  const docs = await prisma.docLink.findMany({
    where: { projectId },
  });

  console.log("📄 Total docs:", docs.length);

  // 🔥 3. similarity compare
  const scoredDocs = docs.map((doc) => {
    const score = cosineSimilarity(
      queryEmbedding,
      doc.embedding as number[]
    );

    return {
      ...doc,
      score,
    };
  });

  // 🔥 4. sort + top results
  const topDocs = scoredDocs
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  console.log("🏆 TOP MATCHES:");
  topDocs.forEach((doc, i) => {
    console.log(`${i + 1}. ${doc.title} (${doc.score.toFixed(3)})`);
  });

  return topDocs;
}