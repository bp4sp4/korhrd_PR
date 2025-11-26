import { notFound } from 'next/navigation';
import { getTemplateBySlug } from '@/lib/template-actions';
import TemplateView from '@/components/TemplateView';

interface TemplatePageProps {
  params: Promise<{ slug: string }>;
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

  return <TemplateView template={template} />;
}

export async function generateMetadata({ params }: TemplatePageProps) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);

  if (!template) {
    return {
      title: '템플릿을 찾을 수 없습니다',
    };
  }

  return {
    title: `${template.name}`,
    description: template.description || '',
  };
}


