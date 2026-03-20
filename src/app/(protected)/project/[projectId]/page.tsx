type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;
  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold">
        Project: {projectId}
      </h1>
    </div>
  );
}