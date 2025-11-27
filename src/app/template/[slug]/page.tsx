import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
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

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <TemplateView template={template} />
    </div>
  );
}

export async function generateMetadata({ params }: TemplatePageProps) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);

  if (!template) {
    return {
      title: '템플릿을 찾을 수 없습니다',
    };
  }

  // 현재 호스트 URL 가져오기
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;

  // OG 이미지 URL 생성 - 헤더의 백그라운드 이미지(heroImage) 사용
  let ogImageUrl: string | undefined;
  if (template.heroImage) {
    // heroImage가 이미 절대 URL인지 확인 (Supabase Storage URL 등)
    if (template.heroImage.startsWith('http://') || template.heroImage.startsWith('https://')) {
      // 이미 절대 URL이면 그대로 사용 (예: Supabase Storage URL)
      ogImageUrl = template.heroImage;
    } else {
      // 상대 경로인 경우 절대 URL로 변환
      ogImageUrl = `${baseUrl}${template.heroImage.startsWith('/') ? '' : '/'}${template.heroImage}`;
    }
  }

  // 제목 형식: "템플릿 이름 | 프로필"
  const pageTitle = `${template.name} | 프로필`;
  const ogTitle = `${template.name}의 프로필`;

  return {
    title: pageTitle,
    description: template.description || `${template.name}의 프로필을 확인해보세요!`,
    openGraph: {
      title: ogTitle,
      description: template.description || `${template.name}의 프로필을 확인해보세요!`,
      type: 'website',
      url: `${baseUrl}/template/${slug}`,
      ...(ogImageUrl && {
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: template.name,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: template.description || `${template.name}의 프로필을 확인해보세요!`,
      ...(ogImageUrl && {
        images: [ogImageUrl],
      }),
    },
  };
}


