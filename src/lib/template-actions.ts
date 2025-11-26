'use server';

import { createClient } from './supabase/server';
import {
  ProfileTemplate,
  TemplateSection,
  TemplateSectionItem,
  TemplateFooterItem,
  CreateTemplateData,
  UpdateTemplateData,
  CreateSectionData,
  CreateSectionItemData,
  CreateFooterItemData,
} from '@/types/template';

// 서버 측에서 관리자 권한 확인
async function checkAdminPermission(): Promise<boolean> {
  const supabase = await createClient();
  
  // 현재 로그인한 사용자 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return false;
  }

  // 프로필에서 역할 확인
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return false;
  }

  return profile.role === 'admin';
}

// 템플릿을 ProfileTemplate 타입으로 변환
function templateToProfileTemplate(template: any): ProfileTemplate {
  return {
    id: template.id,
    slug: template.slug,
    name: template.name,
    description: template.description,
    heroImage: template.hero_image,
    kakaoLink: template.kakao_link,
    phoneLink: template.phone_link,
    introMessage: template.intro_message || null,
    introItems: template.intro_items 
      ? (Array.isArray(template.intro_items) 
          ? template.intro_items 
          : JSON.parse(template.intro_items || '[]'))
      : null,
    phoneNumber: template.phone_number || null,
    footerText: template.footer_text,
    footerChecklistItems: template.footer_checklist_items 
      ? (Array.isArray(template.footer_checklist_items) 
          ? template.footer_checklist_items 
          : JSON.parse(template.footer_checklist_items || '[]'))
      : null,
    footer2Title: template.footer2_title || null,
    footer2Buttons: template.footer2_buttons 
      ? (Array.isArray(template.footer2_buttons) 
          ? template.footer2_buttons 
          : JSON.parse(template.footer2_buttons || '[]'))
      : null,
    verified: template.verified || false,
    createdAt: template.created_at || new Date().toISOString(),
    updatedAt: template.updated_at || new Date().toISOString(),
  };
}

// 섹션을 TemplateSection 타입으로 변환
function sectionToTemplateSection(section: any): TemplateSection {
  return {
    id: section.id,
    templateId: section.template_id,
    title: section.title,
    orderIndex: section.order_index || 0,
    createdAt: section.created_at || new Date().toISOString(),
    updatedAt: section.updated_at || new Date().toISOString(),
  };
}

// 섹션 아이템을 TemplateSectionItem 타입으로 변환
function itemToSectionItem(item: any): TemplateSectionItem {
  return {
    id: item.id,
    sectionId: item.section_id,
    text: item.text,
    orderIndex: item.order_index || 0,
    createdAt: item.created_at || new Date().toISOString(),
  };
}

// 푸터 아이템을 TemplateFooterItem 타입으로 변환
function footerItemToTemplateFooterItem(item: any): TemplateFooterItem {
  return {
    id: item.id,
    templateId: item.template_id,
    emoji: item.emoji,
    title: item.title,
    description: item.description,
    image: item.image,
    images: item.images ? (Array.isArray(item.images) ? item.images : JSON.parse(item.images || '[]')) : null,
    orderIndex: item.order_index || 0,
    createdAt: item.created_at || new Date().toISOString(),
    updatedAt: item.updated_at || new Date().toISOString(),
  };
}

// 모든 템플릿 조회
export async function getAllTemplates(): Promise<ProfileTemplate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profile_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }

  return (data || []).map(templateToProfileTemplate);
}

// ID로 템플릿 조회 (섹션과 푸터 아이템 포함)
export async function getTemplateById(id: string): Promise<ProfileTemplate | null> {
  const supabase = await createClient();
  
  // 템플릿 기본 정보 조회
  const { data: templateData, error: templateError } = await supabase
    .from('profile_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (templateError || !templateData) {
    return null;
  }

  const template = templateToProfileTemplate(templateData);

  // 섹션 조회
  const { data: sectionsData, error: sectionsError } = await supabase
    .from('template_sections')
    .select('*')
    .eq('template_id', template.id)
    .order('order_index', { ascending: true });

  if (!sectionsError && sectionsData) {
    template.sections = sectionsData.map(sectionToTemplateSection);

    // 각 섹션의 아이템 조회
    for (const section of template.sections) {
      const { data: itemsData, error: itemsError } = await supabase
        .from('template_section_items')
        .select('*')
        .eq('section_id', section.id)
        .order('order_index', { ascending: true });

      if (!itemsError && itemsData) {
        section.items = itemsData.map(itemToSectionItem);
      }
    }
  }

  // 푸터 아이템 조회
  const { data: footerData, error: footerError } = await supabase
    .from('template_footer_items')
    .select('*')
    .eq('template_id', template.id)
    .order('order_index', { ascending: true });

  if (!footerError && footerData) {
    template.footerItems = footerData.map(footerItemToTemplateFooterItem);
  }

  return template;
}

// 슬러그로 템플릿 조회 (섹션과 푸터 아이템 포함)
export async function getTemplateBySlug(slug: string): Promise<ProfileTemplate | null> {
  const supabase = await createClient();
  
  // 템플릿 기본 정보 조회
  const { data: templateData, error: templateError } = await supabase
    .from('profile_templates')
    .select('*')
    .eq('slug', slug)
    .single();

  if (templateError || !templateData) {
    return null;
  }

  const template = templateToProfileTemplate(templateData);

  // 섹션 조회
  const { data: sectionsData, error: sectionsError } = await supabase
    .from('template_sections')
    .select('*')
    .eq('template_id', template.id)
    .order('order_index', { ascending: true });

  if (!sectionsError && sectionsData) {
    template.sections = sectionsData.map(sectionToTemplateSection);

    // 각 섹션의 아이템 조회
    for (const section of template.sections) {
      const { data: itemsData, error: itemsError } = await supabase
        .from('template_section_items')
        .select('*')
        .eq('section_id', section.id)
        .order('order_index', { ascending: true });

      if (!itemsError && itemsData) {
        section.items = itemsData.map(itemToSectionItem);
      }
    }
  }

  // 푸터 아이템 조회
  const { data: footerData, error: footerError } = await supabase
    .from('template_footer_items')
    .select('*')
    .eq('template_id', template.id)
    .order('order_index', { ascending: true });

  if (!footerError && footerData) {
    template.footerItems = footerData.map(footerItemToTemplateFooterItem);
  }

  return template;
}

// 템플릿 생성
export async function createTemplate(data: CreateTemplateData): Promise<ProfileTemplate> {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  const supabase = await createClient();
  
  // 슬러그 중복 체크
  const { data: existing } = await supabase
    .from('profile_templates')
    .select('id')
    .eq('slug', data.slug)
    .single();

  if (existing) {
    throw new Error('이미 존재하는 슬러그입니다.');
  }

  const { data: templateData, error } = await supabase
    .from('profile_templates')
    .insert({
      slug: data.slug,
      name: data.name,
      description: data.description || null,
      hero_image: data.heroImage || null,
      kakao_link: data.kakaoLink || null,
      phone_link: data.phoneLink || null,
      intro_message: data.introMessage || null,
      intro_items: data.introItems ? JSON.stringify(data.introItems) : null,
      phone_number: data.phoneNumber || null,
      footer_text: data.footerText || null,
      footer_checklist_items: data.footerChecklistItems ? JSON.stringify(data.footerChecklistItems) : null,
      footer2_title: data.footer2Title || null,
      footer2_buttons: data.footer2Buttons ? JSON.stringify(data.footer2Buttons) : null,
      verified: data.verified || false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || '템플릿 생성에 실패했습니다.');
  }

  return templateToProfileTemplate(templateData);
}

// 템플릿 업데이트
export async function updateTemplate(
  templateId: string,
  data: UpdateTemplateData
): Promise<ProfileTemplate> {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  const supabase = await createClient();
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.heroImage !== undefined) updateData.hero_image = data.heroImage;
  if (data.kakaoLink !== undefined) updateData.kakao_link = data.kakaoLink;
  if (data.phoneLink !== undefined) updateData.phone_link = data.phoneLink;
  if (data.introMessage !== undefined) updateData.intro_message = data.introMessage;
  if (data.introItems !== undefined) updateData.intro_items = data.introItems ? JSON.stringify(data.introItems) : null;
  if (data.phoneNumber !== undefined) updateData.phone_number = data.phoneNumber;
  if (data.footerText !== undefined) updateData.footer_text = data.footerText;
  if (data.footerChecklistItems !== undefined) updateData.footer_checklist_items = data.footerChecklistItems ? JSON.stringify(data.footerChecklistItems) : null;
  if (data.footer2Title !== undefined) updateData.footer2_title = data.footer2Title;
  if (data.footer2Buttons !== undefined) updateData.footer2_buttons = data.footer2Buttons ? JSON.stringify(data.footer2Buttons) : null;
  if (data.verified !== undefined) updateData.verified = data.verified;

  const { data: templateData, error } = await supabase
    .from('profile_templates')
    .update(updateData)
    .eq('id', templateId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || '템플릿 업데이트에 실패했습니다.');
  }

  return templateToProfileTemplate(templateData);
}

// 템플릿 삭제
export async function deleteTemplate(templateId: string): Promise<boolean> {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profile_templates')
    .delete()
    .eq('id', templateId);

  if (error) {
    throw new Error(error.message || '템플릿 삭제에 실패했습니다.');
  }

  return true;
}

// 섹션 생성
export async function createSection(data: CreateSectionData): Promise<TemplateSection> {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  const supabase = await createClient();
  const { data: sectionData, error } = await supabase
    .from('template_sections')
    .insert({
      template_id: data.templateId,
      title: data.title,
      order_index: data.orderIndex || 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || '섹션 생성에 실패했습니다.');
  }

  return sectionToTemplateSection(sectionData);
}

// 섹션 업데이트
export async function updateSection(
  sectionId: string,
  title: string,
  orderIndex?: number
): Promise<TemplateSection> {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  const supabase = await createClient();
  const updateData: any = {
    title,
    updated_at: new Date().toISOString(),
  };
  if (orderIndex !== undefined) {
    updateData.order_index = orderIndex;
  }

  const { data: sectionData, error } = await supabase
    .from('template_sections')
    .update(updateData)
    .eq('id', sectionId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || '섹션 업데이트에 실패했습니다.');
  }

  return sectionToTemplateSection(sectionData);
}

// 섹션 삭제
export async function deleteSection(sectionId: string): Promise<boolean> {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('template_sections')
    .delete()
    .eq('id', sectionId);

  if (error) {
    throw new Error(error.message || '섹션 삭제에 실패했습니다.');
  }

  return true;
}

// 섹션 아이템 생성
export async function createSectionItem(data: CreateSectionItemData): Promise<TemplateSectionItem> {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  const supabase = await createClient();
  const { data: itemData, error } = await supabase
    .from('template_section_items')
    .insert({
      section_id: data.sectionId,
      text: data.text,
      order_index: data.orderIndex || 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || '섹션 아이템 생성에 실패했습니다.');
  }

  return itemToSectionItem(itemData);
}

// 섹션 아이템 삭제
export async function deleteSectionItem(itemId: string): Promise<boolean> {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('template_section_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    throw new Error(error.message || '섹션 아이템 삭제에 실패했습니다.');
  }

  return true;
}

// 푸터 아이템 생성
export async function createFooterItem(data: CreateFooterItemData): Promise<TemplateFooterItem> {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  const supabase = await createClient();
  const { data: itemData, error } = await supabase
    .from('template_footer_items')
    .insert({
      template_id: data.templateId,
      emoji: data.emoji || null,
      title: data.title,
      description: data.description || null,
      image: data.image || null,
      images: data.images ? JSON.stringify(data.images) : null,
      order_index: data.orderIndex || 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || '푸터 아이템 생성에 실패했습니다.');
  }

  return footerItemToTemplateFooterItem(itemData);
}

// 푸터 아이템 업데이트
export async function updateFooterItem(
  itemId: string,
  data: Partial<CreateFooterItemData>
): Promise<TemplateFooterItem> {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  const supabase = await createClient();
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };
  if (data.emoji !== undefined) updateData.emoji = data.emoji;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.image !== undefined) updateData.image = data.image;
  if (data.images !== undefined) updateData.images = data.images ? JSON.stringify(data.images) : null;
  if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;

  const { data: itemData, error } = await supabase
    .from('template_footer_items')
    .update(updateData)
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || '푸터 아이템 업데이트에 실패했습니다.');
  }

  return footerItemToTemplateFooterItem(itemData);
}

// 푸터 아이템 삭제
export async function deleteFooterItem(itemId: string): Promise<boolean> {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('template_footer_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    throw new Error(error.message || '푸터 아이템 삭제에 실패했습니다.');
  }

  return true;
}

