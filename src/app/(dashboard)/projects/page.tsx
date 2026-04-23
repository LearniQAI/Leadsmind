import { getProjects } from '@/app/actions/projects';
import { ProjectsClient } from '@/components/projects/ProjectsClient';

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <ProjectsClient initialProjects={projects} />
  );
}
