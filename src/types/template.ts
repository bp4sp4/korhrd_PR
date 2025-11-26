export interface IntroItem {
  emoji: string;
  text: string;
}

export interface Footer2Button {
  type: 'kakao' | 'phone' | 'blog' | 'instagram';
  label: string;
  url: string;
}

export interface ProfileTemplate {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  heroImage: string | null;
  kakaoLink: string | null;
  phoneLink: string | null;
  introMessage: string | null;
  introItems: IntroItem[] | null;
  phoneNumber: string | null;
  footerText: string | null;
  footerChecklistItems: string[] | null;
  footer2Title: string | null;
  footer2Buttons: Footer2Button[] | null;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  sections?: TemplateSection[];
  footerItems?: TemplateFooterItem[];
}

export interface TemplateSection {
  id: string;
  templateId: string;
  title: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  items?: TemplateSectionItem[];
}

export interface TemplateSectionItem {
  id: string;
  sectionId: string;
  text: string;
  orderIndex: number;
  createdAt: string;
}

export interface TemplateFooterItem {
  id: string;
  templateId: string;
  emoji: string | null;
  title: string;
  description: string | null;
  image: string | null;
  images: string[] | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateData {
  slug: string;
  name: string;
  description?: string;
  heroImage?: string;
  kakaoLink?: string;
  phoneLink?: string;
  introMessage?: string;
  introItems?: IntroItem[];
  phoneNumber?: string;
  footerText?: string;
  footerChecklistItems?: string[];
  footer2Title?: string;
  footer2Buttons?: Footer2Button[];
  verified?: boolean;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  heroImage?: string;
  kakaoLink?: string;
  phoneLink?: string;
  introMessage?: string;
  introItems?: IntroItem[];
  phoneNumber?: string;
  footerText?: string;
  footerChecklistItems?: string[];
  footer2Title?: string;
  footer2Buttons?: Footer2Button[];
  verified?: boolean;
}

export interface CreateSectionData {
  templateId: string;
  title: string;
  orderIndex?: number;
}

export interface CreateSectionItemData {
  sectionId: string;
  text: string;
  orderIndex?: number;
}

export interface CreateFooterItemData {
  templateId: string;
  emoji?: string;
  title: string;
  description?: string;
  image?: string;
  images?: string[];
  orderIndex?: number;
}

