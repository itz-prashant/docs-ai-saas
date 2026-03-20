import ChatWindowWrapper from "../_components/ChatWindowWrapper";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;
  return (
    <ChatWindowWrapper projectId={projectId}/>
  );
}