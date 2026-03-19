import ProjectPageClient from './ProjectPageClient';
import { demoProjectIds } from '@/lib/mockData';

export function generateStaticParams() {
  return demoProjectIds.map((id) => ({ id }));
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  return <ProjectPageClient params={params} />;
}
