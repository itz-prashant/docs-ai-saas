import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";


let embeddings: HuggingFaceTransformersEmbeddings;

export async function getEmbeddings() {
    if(!embeddings){
        embeddings = new HuggingFaceTransformersEmbeddings({
        model: "Xenova/all-MiniLM-L6-v2",
    });
    }
    return embeddings
}

export async function createEmbedding(text: string) {
  const model = await getEmbeddings();
  const vector = await model.embedQuery(text);
  return vector;
}