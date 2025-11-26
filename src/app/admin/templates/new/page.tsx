'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin, getCurrentUser } from '@/lib/auth';
import { createTemplate, createSection, createSectionItem, createFooterItem } from '@/lib/template-actions';
import { uploadImage } from '@/lib/upload-actions';
import TemplateView from '@/components/TemplateView';
import { ProfileTemplate } from '@/types/template';

export default function NewTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    description: '',
    heroImage: '',
    kakaoLink: '',
    phoneLink: '',
    introMessage: '',
    introItems: [] as Array<{ emoji: string; text: string }>,
    phoneNumber: '',
    footerText: '',
    footerChecklistItems: ['1:1 개인별 맞춤 안내가 들어가요.', '원하는 일정에 맞춰 연락드려요.', '성적관리 확실히 도와드려요.'],
    footer2Title: '',
    footer2Buttons: [] as Array<{ type: 'kakao' | 'phone' | 'blog' | 'instagram'; label: string; url: string }>,
    sectionTitle: '',
    verified: false,
  });
  const [newIntroItem, setNewIntroItem] = useState({ emoji: '', text: '' });
  const [sections, setSections] = useState<Array<{ id: string; title: string; items: Array<{ id: string; text: string }> }>>([]);
  const [footerItems, setFooterItems] = useState<Array<{ id: string; emoji: string; title: string; description: string; image: string; images: string[] }>>([]);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionItemText, setNewSectionItemText] = useState<{ [key: string]: string }>({});
  const [newFooterItem, setNewFooterItem] = useState({
    emoji: '',
    title: '',
    description: '',
    image: '',
    images: [] as string[],
  });
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const footerImageInputRef = useRef<HTMLInputElement>(null);
  const contentImagesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const adminCheck = await isAdmin();
        if (!adminCheck) {
          router.push('/');
          return;
        }
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'footer' | 'content') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      if (type === 'content' && files.length > 0) {
        // 여러 이미지 업로드
        const uploadPromises = Array.from(files).map(file => uploadImage(file, 'templates'));
        const urls = await Promise.all(uploadPromises);
        setNewFooterItem({ ...newFooterItem, images: [...newFooterItem.images, ...urls] });
        alert(`${urls.length}개의 이미지가 업로드되었습니다!`);
      } else {
        const file = files[0];
        const url = await uploadImage(file, 'templates');
        if (type === 'hero') {
          setFormData({ ...formData, heroImage: url });
        } else if (type === 'footer') {
          setNewFooterItem({ ...newFooterItem, image: url });
        }
        alert('이미지가 업로드되었습니다!');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.';
      setError(errorMessage);
      
      if (errorMessage.includes('Bucket not found') || errorMessage.includes('버킷')) {
        setTimeout(() => {
          alert(
            'Storage 버킷이 없습니다.\n\n' +
            'Supabase 대시보드에서 다음 단계를 따라주세요:\n' +
            '1. Storage 메뉴로 이동\n' +
            '2. "Create bucket" 클릭\n' +
            '3. Name: "images", Public: true로 설정\n' +
            '4. 생성 완료\n\n' +
            '자세한 내용은 STORAGE_SETUP.md 파일을 참고하세요.'
          );
        }, 100);
      }
    } finally {
      setUploading(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    const sectionId = `temp-${Date.now()}`;
    setSections([...sections, { id: sectionId, title: newSectionTitle, items: [] }]);
    setNewSectionTitle('');
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const handleAddSectionItem = (sectionId: string) => {
    const text = newSectionItemText[sectionId];
    if (!text?.trim()) return;
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, items: [...s.items, { id: `temp-item-${Date.now()}`, text }] }
        : s
    ));
    setNewSectionItemText({ ...newSectionItemText, [sectionId]: '' });
  };

  const handleDeleteSectionItem = (sectionId: string, itemId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, items: s.items.filter(i => i.id !== itemId) }
        : s
    ));
  };

  const handleAddFooterItem = () => {
    if (!newFooterItem.title.trim()) return;
    setFooterItems([...footerItems, {
      id: `temp-footer-${Date.now()}`,
      emoji: newFooterItem.emoji,
      title: newFooterItem.title,
      description: newFooterItem.description,
      image: newFooterItem.image,
      images: newFooterItem.images,
    }]);
    setNewFooterItem({ emoji: '', title: '', description: '', image: '', images: [] });
  };

  const handleDeleteFooterItem = (itemId: string) => {
    setFooterItems(footerItems.filter(f => f.id !== itemId));
  };

  const handleMoveImage = (itemId: string, imageIndex: number, direction: 'up' | 'down') => {
    setFooterItems(footerItems.map(item => {
      if (item.id === itemId && item.images && item.images.length > 0) {
        const newImages = [...item.images];
        if (direction === 'up' && imageIndex > 0) {
          [newImages[imageIndex - 1], newImages[imageIndex]] = [newImages[imageIndex], newImages[imageIndex - 1]];
        } else if (direction === 'down' && imageIndex < newImages.length - 1) {
          [newImages[imageIndex], newImages[imageIndex + 1]] = [newImages[imageIndex + 1], newImages[imageIndex]];
        }
        return { ...item, images: newImages };
      }
      return item;
    }));
  };

  const handleMoveNewFooterItemImage = (imageIndex: number, direction: 'up' | 'down') => {
    if (newFooterItem.images.length === 0) return;
    const newImages = [...newFooterItem.images];
    if (direction === 'up' && imageIndex > 0) {
      [newImages[imageIndex - 1], newImages[imageIndex]] = [newImages[imageIndex], newImages[imageIndex - 1]];
    } else if (direction === 'down' && imageIndex < newImages.length - 1) {
      [newImages[imageIndex], newImages[imageIndex + 1]] = [newImages[imageIndex + 1], newImages[imageIndex]];
    }
    setNewFooterItem({ ...newFooterItem, images: newImages });
  };

  const handleAddIntroItem = () => {
    if (!newIntroItem.text.trim()) return;
    setFormData({
      ...formData,
      introItems: [...formData.introItems, { emoji: newIntroItem.emoji, text: newIntroItem.text }],
    });
    setNewIntroItem({ emoji: '', text: '' });
  };

  const handleDeleteIntroItem = (index: number) => {
    setFormData({
      ...formData,
      introItems: formData.introItems.filter((_, i) => i !== index),
    });
  };

  const handleAddFooter2Buttons = () => {
    // 4개씩 버튼 추가 (카카오톡, 전화, 블로그, 인스타그램)
    const defaultButtons = [
      { type: 'kakao' as const, label: '카톡 상담하기', url: '' },
      { type: 'phone' as const, label: '전화 연결하기', url: '' },
      { type: 'blog' as const, label: '블로그', url: '' },
      { type: 'instagram' as const, label: '인스타그램', url: '' },
    ];
    setFormData({
      ...formData,
      footer2Buttons: [...formData.footer2Buttons, ...defaultButtons],
    });
  };

  const handleDeleteFooter2Button = (index: number) => {
    setFormData({
      ...formData,
      footer2Buttons: formData.footer2Buttons.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // 템플릿 생성
      const template = await createTemplate({
        slug: formData.slug,
        name: formData.name,
        description: formData.description || undefined,
        heroImage: formData.heroImage || undefined,
        kakaoLink: formData.kakaoLink || undefined,
        phoneLink: formData.phoneLink || undefined,
        introMessage: formData.introMessage || undefined,
        introItems: formData.introItems.length > 0 ? formData.introItems : undefined,
        phoneNumber: formData.phoneNumber || undefined,
        footerText: formData.footerText || undefined,
        footerChecklistItems: formData.footerChecklistItems.filter(item => item.trim() !== ''),
        footer2Title: formData.footer2Title || undefined,
        footer2Buttons: formData.footer2Buttons.length > 0 ? formData.footer2Buttons : undefined,
        sectionTitle: formData.sectionTitle || undefined,
        verified: formData.verified,
      });

      // 섹션 생성
      for (const section of sections) {
        const createdSection = await createSection({
          templateId: template.id,
          title: section.title,
          orderIndex: sections.indexOf(section),
        });
        
        // 섹션 아이템 생성
        for (const item of section.items) {
          await createSectionItem({
            sectionId: createdSection.id,
            text: item.text,
            orderIndex: section.items.indexOf(item),
          });
        }
      }

      // 컨텐츠 아이템 생성
      for (const footerItem of footerItems) {
        await createFooterItem({
          templateId: template.id,
          emoji: footerItem.emoji || undefined,
          title: footerItem.title,
          description: footerItem.description || undefined,
          image: footerItem.image || undefined,
          images: footerItem.images.length > 0 ? footerItem.images : undefined,
          orderIndex: footerItems.indexOf(footerItem),
        });
      }

      alert('템플릿이 성공적으로 생성되었습니다!');
      router.push(`/admin/templates/${template.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '템플릿 생성에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">새 템플릿 만들기</h1>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/admin/templates')}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={(e) => {
                  const form = document.querySelector('form');
                  if (form) {
                    form.requestSubmit();
                  }
                }}
                disabled={saving}
                className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? '생성 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-12">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 편집 폼 */}
          <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 */}
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">기본 정보</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  슬러그 (URL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="surin-ssaem"
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL에 사용됩니다. 영문, 숫자, 하이픈만 사용 가능합니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="학습담당자 수린쌤"
                />
              </div>

              {/* 설명 섹션 */}
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900">설명 섹션</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">소개 메시지</label>
                  <input
                    type="text"
                    value={formData.introMessage}
                    onChange={(e) => setFormData({ ...formData, introMessage: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="궁금한 점이 있으시면 편하게 말씀해주세요!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">설명 항목</label>
                  <div className="space-y-2">
                    {formData.introItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
                        <span className="text-lg">{item.emoji}</span>
                        <span className="flex-1 text-sm text-gray-700">{item.text}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteIntroItem(idx)}
                          className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newIntroItem.emoji}
                        onChange={(e) => setNewIntroItem({ ...newIntroItem, emoji: e.target.value })}
                        className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="이모지"
                      />
                      <input
                        type="text"
                        value={newIntroItem.text}
                        onChange={(e) => setNewIntroItem({ ...newIntroItem, text: e.target.value })}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="민서쌤과 1:1로 편하게 상담"
                      />
                      <button
                        type="button"
                        onClick={handleAddIntroItem}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                      >
                        추가
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="010-7902-4225"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">히어로 이미지</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      ref={heroImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'hero')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => heroImageInputRef.current?.click()}
                      disabled={uploading}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      {uploading ? '업로드 중...' : '이미지 업로드'}
                    </button>
                    {formData.heroImage && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, heroImage: '' })}
                        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                      >
                        제거
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.heroImage}
                    onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="이미지 URL 또는 업로드 버튼 클릭"
                  />
                  {formData.heroImage && (
                    <div className="mt-2">
                      <img
                        src={formData.heroImage}
                        alt="미리보기"
                        className="max-w-full h-48 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카카오톡 링크</label>
                  <input
                    type="text"
                    value={formData.kakaoLink}
                    onChange={(e) => setFormData({ ...formData, kakaoLink: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전화 링크</label>
                  <input
                    type="text"
                    value={formData.phoneLink}
                    onChange={(e) => setFormData({ ...formData, phoneLink: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tel:010-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">푸터 문구</label>
                <textarea
                  value={formData.footerText}
                  onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123에게 무료로 교육컨설팅 받아보세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">푸터 체크리스트 항목</label>
                <div className="space-y-2">
                  {formData.footerChecklistItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newItems = [...formData.footerChecklistItems];
                          newItems[idx] = e.target.value;
                          setFormData({ ...formData, footerChecklistItems: newItems });
                        }}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`체크리스트 항목 ${idx + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = formData.footerChecklistItems.filter((_, i) => i !== idx);
                          setFormData({ ...formData, footerChecklistItems: newItems });
                        }}
                        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, footerChecklistItems: [...formData.footerChecklistItems, ''] });
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    항목 추가
                  </button>
                </div>
              </div>

              {/* Footer2 섹션 */}
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900">Footer2 섹션</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Footer2 제목</label>
                  <input
                    type="text"
                    value={formData.footer2Title}
                    onChange={(e) => setFormData({ ...formData, footer2Title: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="민서쌤이 더 궁금하다면?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Footer2 버튼</label>
                  <div className="space-y-2">
                    {formData.footer2Buttons.map((button, idx) => (
                      <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{button.type}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteFooter2Button(idx)}
                            className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                          >
                            삭제
                          </button>
                        </div>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={button.label}
                            onChange={(e) => {
                              const newButtons = [...formData.footer2Buttons];
                              newButtons[idx] = { ...newButtons[idx], label: e.target.value };
                              setFormData({ ...formData, footer2Buttons: newButtons });
                            }}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="버튼 라벨"
                          />
                          <input
                            type="text"
                            value={button.url}
                            onChange={(e) => {
                              const newButtons = [...formData.footer2Buttons];
                              newButtons[idx] = { ...newButtons[idx], url: e.target.value };
                              setFormData({ ...formData, footer2Buttons: newButtons });
                            }}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="URL"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddFooter2Buttons}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      버튼 4개 추가 (카카오톡, 전화, 블로그, 인스타그램)
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verified"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="verified" className="ml-2 text-sm text-gray-700">
                  인증 배지 표시
                </label>
              </div>
            </div>
          </div>

          {/* 섹션 관리 */}
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">섹션 관리</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">섹션 전체 제목</label>
              <input
                type="text"
                value={formData.sectionTitle}
                onChange={(e) => setFormData({ ...formData, sectionTitle: e.target.value })}
                placeholder="예: 학습담당자 민서쌤이 컨설팅 해드려요"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">줄바꿈은 &lt;br/&gt; 태그를 사용하세요</p>
            </div>
            
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="새 섹션 제목 (예: 취업, 자기개발)"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddSection}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                섹션 추가
              </button>
            </div>

            <div className="space-y-6">
              {sections.map((section) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-blue-600">{section.title}</h3>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(section.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                  
                  <div className="mb-3 flex gap-2">
                    <input
                      type="text"
                      value={newSectionItemText[section.id] || ''}
                      onChange={(e) => setNewSectionItemText({ ...newSectionItemText, [section.id]: e.target.value })}
                      placeholder="아이템 텍스트"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSectionItem(section.id)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                    >
                      추가
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {section.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-900">{item.text}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSectionItem(section.id, item.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 컨텐츠 아이템 관리 */}
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">컨텐츠 아이템 관리</h2>
            
            <div className="mb-4 space-y-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={newFooterItem.emoji}
                onChange={(e) => setNewFooterItem({ ...newFooterItem, emoji: e.target.value })}
                placeholder="이모지 (선택)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={newFooterItem.title}
                onChange={(e) => setNewFooterItem({ ...newFooterItem, title: e.target.value })}
                placeholder="타이틀 *"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={newFooterItem.description}
                onChange={(e) => setNewFooterItem({ ...newFooterItem, description: e.target.value })}
                placeholder="설명"
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    ref={footerImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'footer')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => footerImageInputRef.current?.click()}
                    disabled={uploading}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    {uploading ? '업로드 중...' : '아이콘 이미지 업로드'}
                  </button>
                </div>
                <input
                  type="text"
                  value={newFooterItem.image}
                  onChange={(e) => setNewFooterItem({ ...newFooterItem, image: e.target.value })}
                  placeholder="아이콘 이미지 URL (선택)"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {newFooterItem.image && (
                  <div className="mt-2">
                    <img
                      src={newFooterItem.image}
                      alt="미리보기"
                      className="max-w-full h-24 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              
              {/* 여러 이미지 업로드 (스와이프용) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">스와이프 이미지 (여러 개)</label>
                <div className="flex gap-2">
                  <input
                    ref={contentImagesInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, 'content')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => contentImagesInputRef.current?.click()}
                    disabled={uploading}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    {uploading ? '업로드 중...' : '이미지 여러 개 업로드'}
                  </button>
                </div>
                {newFooterItem.images.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2">
                    {newFooterItem.images.map((imgUrl, idx) => (
                      <div key={idx} className="relative flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveNewFooterItemImage(idx, 'up')}
                            disabled={idx === 0}
                            className="bg-blue-500 text-white rounded px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveNewFooterItemImage(idx, 'down')}
                            disabled={idx === newFooterItem.images.length - 1}
                            className="bg-blue-500 text-white rounded px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
                          >
                            ↓
                          </button>
                        </div>
                        <img
                          src={imgUrl}
                          alt={`이미지 ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                        <span className="text-xs text-gray-500">순서: {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setNewFooterItem({
                              ...newFooterItem,
                              images: newFooterItem.images.filter((_, i) => i !== idx),
                            });
                          }}
                          className="ml-auto bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={handleAddFooterItem}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                컨텐츠 아이템 추가
              </button>
            </div>

            <div className="space-y-4">
              {footerItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {item.emoji && <span className="text-2xl">{item.emoji}</span>}
                        <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      )}
                      {item.image && (
                        <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded mb-2" />
                      )}
                      {item.images && item.images.length > 0 && (
                        <div className="flex flex-col gap-2 mt-2">
                          {item.images.map((imgUrl, idx) => (
                            <div key={idx} className="relative flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                              <div className="flex flex-col gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(item.id, idx, 'up')}
                                  disabled={idx === 0}
                                  className="bg-blue-500 text-white rounded px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(item.id, idx, 'down')}
                                  disabled={idx === item.images.length - 1}
                                  className="bg-blue-500 text-white rounded px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
                                >
                                  ↓
                                </button>
                              </div>
                              <img src={imgUrl} alt={`${item.title} 이미지 ${idx + 1}`} className="w-16 h-16 object-cover rounded" />
                              <span className="text-xs text-gray-500">순서: {idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFooterItems(footerItems.map(f => 
                                    f.id === item.id 
                                      ? { ...f, images: f.images.filter((_, i) => i !== idx) }
                                      : f
                                  ));
                                }}
                                className="ml-auto bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteFooterItem(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </form>

          {/* 오른쪽: 실시간 미리보기 */}
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 overflow-auto max-h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4  top-0 bg-white pb-2 border-b z-10">
                실시간 미리보기
              </h3>
              <div className="flex justify-center">
                <TemplateView
                  template={{
                    id: 'preview',
                    slug: formData.slug || 'preview',
                    name: formData.name || '템플릿 이름',
                    description: null,
                    heroImage: formData.heroImage || null,
                    kakaoLink: formData.kakaoLink || null,
                    phoneLink: formData.phoneLink || null,
                    introMessage: formData.introMessage || null,
                    introItems: formData.introItems.length > 0 ? formData.introItems : null,
                    phoneNumber: formData.phoneNumber || null,
                    footerText: formData.footerText || null,
                    footerChecklistItems: formData.footerChecklistItems.filter(item => item.trim() !== ''),
                    footer2Title: formData.footer2Title || null,
                    footer2Buttons: formData.footer2Buttons.length > 0 ? formData.footer2Buttons : null,
                    sectionTitle: formData.sectionTitle || null,
                    verified: formData.verified,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    sections: sections.map((s, idx) => ({
                      id: s.id,
                      templateId: 'preview',
                      title: s.title,
                      orderIndex: idx,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      items: s.items.map((item, itemIdx) => ({
                        id: item.id,
                        sectionId: s.id,
                        text: item.text,
                        orderIndex: itemIdx,
                        createdAt: new Date().toISOString(),
                      })),
                    })),
                    footerItems: footerItems.map((item, idx) => ({
                      id: item.id,
                      templateId: 'preview',
                      emoji: item.emoji || null,
                      title: item.title,
                      description: item.description || null,
                      image: item.image || null,
                      images: item.images.length > 0 ? item.images : null,
                      orderIndex: idx,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    })),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
