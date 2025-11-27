'use client';
import { ProfileTemplate } from '@/types/template';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import styles from './ProfileTemplate.module.css';

interface TemplateViewProps {
  template: ProfileTemplate;
}

export default function TemplateView({ template }: TemplateViewProps) {
  return (
    <div className={styles.pageContainer}>
      <header 
        className={styles.header}
        style={template.heroImage ? {
          backgroundImage: `url(${template.heroImage})`,
        } : undefined}
      >
     
        <div className={styles.heroSection}></div>
      </header>
      
      <section className={styles.contentsSection}>
        <div className={styles.contentsTitle}>
          <h1 className={styles.contentsTitleText}>
            {template.name}
            {template.verified && (
              <span className={styles.starIcon}>
                <svg width="26" height="26" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.915 9.99688L19.7112 8.23887C20.2467 7.73196 19.997 6.8311 19.2947 6.66314L16.8474 6.03853L17.5373 3.61607C17.7323 2.91927 17.0752 2.26205 16.3787 2.45705L13.957 3.14716L13.3326 0.699079C13.1674 0.00771269 12.2565 -0.245139 11.7574 0.282361L10 2.09259L8.24263 0.2824C7.74927 -0.239123 6.83454 -0.000178003 6.66743 0.699118L6.04306 3.1472L3.62137 2.45708C2.92461 2.26201 2.26782 2.91947 2.46274 3.61611L3.15262 6.03857L0.705352 6.66317C0.00269399 6.83118 -0.246486 7.7322 0.288749 8.23887L2.08504 9.99688L0.288749 11.7548C-0.246721 12.2618 0.00296751 13.1626 0.705313 13.3306L3.15258 13.9552L2.4627 16.3777C2.26774 17.0745 2.92477 17.7317 3.62133 17.5367L6.04298 16.8466L6.66736 19.2946C6.84076 20.0202 7.74923 20.2328 8.24255 19.7114L10 17.9144L11.7574 19.7114C12.2457 20.2382 13.1632 20.0038 13.3326 19.2946L13.957 16.8466L16.3786 17.5367C17.0753 17.7318 17.7322 17.0743 17.5373 16.3777L16.8474 13.9552L19.2946 13.3306C19.9973 13.1625 20.2464 12.2616 19.7112 11.7548L17.915 9.99688Z" fill="#4881F7"></path>
                  <path d="M8.58888 13.4774L5.72887 10.6881C5.55705 10.5206 5.55705 10.2489 5.72887 10.0813L6.35111 9.4744C6.52294 9.30681 6.80155 9.30681 6.97337 9.4744L8.90001 11.3534L13.0267 7.32881C13.1985 7.16123 13.4771 7.16123 13.6489 7.32881L14.2712 7.93568C14.443 8.10325 14.443 8.37495 14.2712 8.54254L9.21114 13.4774C9.0393 13.645 8.76071 13.645 8.58888 13.4774Z" fill="white"></path>
                </svg>
              </span>
            )}
          </h1>
          
          {/* 설명 섹션 */}
          {(template.introMessage || (template.introItems && template.introItems.length > 0) || template.phoneNumber) && (
            <div className={styles.introSection}>
              {template.introMessage && (
                <p className={styles.introMessage}>
                  {template.introMessage}
                </p>
              )}
              {template.introItems && template.introItems.length > 0 && (
                <div className={styles.introItems}>
                  {template.introItems.map((item, idx) => (
                    <div key={idx} className={styles.introItem}>
                      <span className={styles.introItemEmoji}>{item.emoji}</span>
                      <span className={styles.introItemText}>{item.text}</span>
                    </div>
                  ))}
                </div>
              )}
              {template.phoneNumber && (
                <p className={styles.phoneNumber}>
                  {template.phoneNumber}
                </p>
              )}
            </div>
          )}
          
          <div className={styles.contentsTitleButtons}>
            {template.kakaoLink && (
              <a
                href={template.kakaoLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.kakaoButton}
              >
                <img src="/kakotalk.png" alt="카카오톡" className={styles.kakaoIcon} />
                카톡 상담하기
              </a>
            )}
            {template.phoneLink && (
              <a
                href={template.phoneLink}
                className={styles.phoneButton}
              >
                <img src="/phone.png" alt="전화" className={styles.phoneIcon} />
                전화 연결하기
              </a>
            )}
          </div>
        </div>

        {/* 섹션들 */}
        {template.sections && template.sections.length > 0 && (
          <section className={styles.consultationSection}>
            <div className={styles.consultationTitle}>
              <h1 
                className={styles.consultationTitleText}
                dangerouslySetInnerHTML={{ 
                  __html: template.sectionTitle || `${template.name}이<br/>컨설팅 해드려요` 
                }}
              />
              {template.sections.map((section) => (
                <div key={section.id}>
                  <p className={styles.consultationItemTitle}>{section.title}</p>
                  {section.items && section.items.length > 0 && (
                    <div className={styles.consultationItemContentContainer}>
                      {section.items.map((item) => (
                        <div key={item.id} className={styles.consultationItemContent}>
                          <p>{item.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 컨텐츠 아이템들 - 세로 배치 */}
        {template.footerItems && template.footerItems.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {template.footerItems.map((footerItem) => (
              <div key={footerItem.id} className={styles.consultstudySection}>
                {footerItem.image && (
                  <img 
                    src={footerItem.image} 
                    alt={footerItem.title} 
                    className={styles.consultationTitleImage} 
                  />
                )}
                <div className={styles.consultstudyTitle}>
                  <p className={styles.consultstudyTitleText}>
                    {footerItem.emoji && <span className={styles.footerItemEmoji}>{footerItem.emoji}</span>}
                    {footerItem.title}
                  </p>
                  {footerItem.description && (
                    <p className={styles.consultstudyTitleDescription}>
                      {footerItem.description.split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < footerItem.description!.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  )}
                  {/* 스와이프 이미지 */}
                  {footerItem.images && footerItem.images.length > 0 && (
                    <Swiper
                      spaceBetween={8}
                      slidesPerView={1.5}
                      className={styles.swiperContainer}
                    >
                      {footerItem.images.map((imgUrl, idx) => (
                        <SwiperSlide key={idx}>
                          <img 
                            src={imgUrl} 
                            alt={`${footerItem.title} ${idx + 1}`} 
                            className={styles.swiperImage}
                            onError={(e) => {
                              console.error('이미지 로드 실패:', imgUrl);
                              e.currentTarget.style.display = 'none';
                            }}
                            loading="lazy"
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QNA 섹션 - 푸터 문구 동적 표시 */}
        <div className={styles.qnaSection}>
          <h1 className={styles.qnaTitle}>
            {template.footerText ? (
              template.footerText.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < template.footerText!.split('\n').length - 1 && <br />}
                </span>
              ))
            ) : (
              <>
                {template.name}에게 무료로<br/>교육컨설팅 받아보세요
              </>
            )}
          </h1>
          <div className={styles.qnaContent}>
            <div className={styles.qnaContentItem}>
              {(template.footerChecklistItems && template.footerChecklistItems.length > 0 
                ? template.footerChecklistItems 
                : ['1:1 개인별 맞춤 안내가 들어가요.', '원하는 일정에 맞춰 연락드려요.', '성적관리 확실히 도와드려요.']
              ).map((item, idx) => (
                <p key={idx} className={styles.qnaContentItemText}>
                  <img width={20} height={20} src="/fe_check.png" alt="체크" className={styles.qnaIcon} />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Footer2 섹션 */}
        {(template.footer2Title || (template.footer2Buttons && template.footer2Buttons.length > 0)) && (
          <div className={styles.footer2Section}>
            {template.footer2Title && (
              <h2 className={styles.footer2Title}>{template.footer2Title}</h2>
            )}
            {template.footer2Buttons && template.footer2Buttons.length > 0 && (
              <div className={styles.footer2Buttons}>
                {template.footer2Buttons.map((button, idx) => (
                  <a
                    key={idx}
                    href={button.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.footer2Button} ${styles[`footer2Button${button.type.charAt(0).toUpperCase() + button.type.slice(1)}`]}`}
                  >
                    {button.type === 'kakao' && (
                      <img src="/kakotalk.png" alt="카카오톡" className={styles.footer2ButtonIcon} />
                    )}
                    {button.type === 'phone' && (
                      <img src="/phone.png" alt="전화" className={styles.footer2ButtonIcon} />
                    )}
                    {button.type === 'blog' && (
                    <img src="/blog.png" alt="전화" className={styles.footer2ButtonIcon} />
                    )}
                    {button.type === 'instagram' && (
                      <svg className={styles.footer2ButtonIcon} viewBox="0 0 24 24" fill="white">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    )}
                    <span className={styles.footer2ButtonText}>{button.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 공유하기 버튼 */}
        <div className={styles.shareSection}>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: template.name,
                  text: `${template.name}의 프로필을 확인해보세요!`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                // 공유 API가 없는 경우 URL 복사
                navigator.clipboard.writeText(window.location.href);
                alert('링크가 클립보드에 복사되었습니다!');
              }
            }}
            className={styles.shareButton}
          >
            <img src="/share.png" alt="공유" className={styles.shareIcon} />
            공유하기
          </button>
        </div>
      </section>

      {/* 플로팅 메뉴 */}
      {(template.kakaoLink || template.phoneLink) && (
        <div className={styles.floatingMenu}>
          {template.kakaoLink && (
            <a
              href={template.kakaoLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.floatingKakaoButton}
            >
              <img src="/kakotalk.png" alt="카카오톡" className={styles.floatingButtonIcon} />
            </a>
          )}
          {template.phoneLink && (
            <a
              href={template.phoneLink}
              className={styles.floatingPhoneButton}
            >
              <img src="/phone.png" alt="전화" className={styles.floatingButtonIcon} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

