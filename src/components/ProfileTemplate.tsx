'use client';

import Image from 'next/image';
import { User } from '@/types/user';
import Link from 'next/link';
import { canEdit, getCurrentUser, signOut } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './ProfileTemplate.module.css';

interface ProfileTemplateProps {
  user: User;
}

export default function ProfileTemplate({ user }: ProfileTemplateProps) {
  const router = useRouter();
  const [canEditProfile, setCanEditProfile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkPermission() {
      const currentUser = await getCurrentUser();
      setIsLoggedIn(currentUser !== null);
      
      const canEditResult = await canEdit(user.username);
      setCanEditProfile(canEditResult);
    }
    checkPermission();
  }, [user.username]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    
    <div className={styles.pageContainer}>
      
      <header className={styles.header}>
        <div className={styles.headerButtons}>
        <button className={styles.uploadButton} aria-label="업로드">
          <img src="/upload.png" alt="업로드" className={styles.uploadIcon} />
        </button>
        <button className={styles.notificationButton} aria-label="알림">
          <img src="/bell.png" alt="알림" className={styles.bellIcon} />
        </button>
        </div>
        <div className={styles.logo}>
          <span><img src="/eduvisors.png" alt="Eduvisors Logo" /></span>
          <div className={styles.navButtons} style={{ marginLeft: 'auto' }}>
            {canEditProfile && (
              <Link
                href={`/user/${user.username}/edit`}
                className={styles.editButton}
              >
                편집
              </Link>
            )}
            {isLoggedIn && canEditProfile && (
              <button
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                로그아웃
              </button>
            )}
          </div>
        </div>
        <div className={styles.heroSection}>
        </div>
      </header>
      <section className={styles.contentsSection}>
      
        <div className={styles.contentsTitle}>
          <h1 className={styles.contentsTitleText}>
            학습담당자 수린쌤
            <span className={styles.starIcon}>
              <svg width="26" height="26" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.915 9.99688L19.7112 8.23887C20.2467 7.73196 19.997 6.8311 19.2947 6.66314L16.8474 6.03853L17.5373 3.61607C17.7323 2.91927 17.0752 2.26205 16.3787 2.45705L13.957 3.14716L13.3326 0.699079C13.1674 0.00771269 12.2565 -0.245139 11.7574 0.282361L10 2.09259L8.24263 0.2824C7.74927 -0.239123 6.83454 -0.000178003 6.66743 0.699118L6.04306 3.1472L3.62137 2.45708C2.92461 2.26201 2.26782 2.91947 2.46274 3.61611L3.15262 6.03857L0.705352 6.66317C0.00269399 6.83118 -0.246486 7.7322 0.288749 8.23887L2.08504 9.99688L0.288749 11.7548C-0.246721 12.2618 0.00296751 13.1626 0.705313 13.3306L3.15258 13.9552L2.4627 16.3777C2.26774 17.0745 2.92477 17.7317 3.62133 17.5367L6.04298 16.8466L6.66736 19.2946C6.84076 20.0202 7.74923 20.2328 8.24255 19.7114L10 17.9144L11.7574 19.7114C12.2457 20.2382 13.1632 20.0038 13.3326 19.2946L13.957 16.8466L16.3786 17.5367C17.0753 17.7318 17.7322 17.0743 17.5373 16.3777L16.8474 13.9552L19.2946 13.3306C19.9973 13.1625 20.2464 12.2616 19.7112 11.7548L17.915 9.99688Z" fill="#4881F7"></path>
                <path d="M8.58888 13.4774L5.72887 10.6881C5.55705 10.5206 5.55705 10.2489 5.72887 10.0813L6.35111 9.4744C6.52294 9.30681 6.80155 9.30681 6.97337 9.4744L8.90001 11.3534L13.0267 7.32881C13.1985 7.16123 13.4771 7.16123 13.6489 7.32881L14.2712 7.93568C14.443 8.10325 14.443 8.37495 14.2712 8.54254L9.21114 13.4774C9.0393 13.645 8.76071 13.645 8.58888 13.4774Z" fill="white"></path>
              </svg>
            </span>
          </h1>
          <p className={styles.contentsTitleDescription}>교육 어렵지 않고 함께라면 가능해요. <br/>시작부터 목표까지 고민 끝!</p>
          <div className={styles.contentsTitleButtons}>
            <button className={styles.kakaoButton}>
              <img src="/kakotalk.png" alt="카카오톡" className={styles.kakaoIcon} />
              카톡 상담하기
            </button>
            <button className={styles.phoneButton}>
              <img src="/phone.png" alt="전화" className={styles.phoneIcon} />
              전화 상담하기
            </button>
          </div>
        </div>
        <section className={styles.consultationSection}>
      <div className={styles.consultationTitle}>
        <h1>수린쌤이<br/>컨설팅 해드려요</h1>
            <p className={styles.consultationItemTitle}> 취업</p>
            <div className={styles.consultationItemContentContainer}>
              <div className={styles.consultationItemContent}>
              <p>취업 컨설팅</p>
              </div>
              <div className={styles.consultationItemContent}>
              <p>보육교사 자격증</p>
              </div>
              <div className={styles.consultationItemContent}>
              <p>한국어교원 자격증</p>
              </div>
              <div className={styles.consultationItemContent}>
              <p>평생교육사 자격증</p>
              </div>
            </div>
            <p className={styles.consultationItemTitle}> 자기계발</p>
            <div className={styles.consultationItemContentContainer}>
              <div className={styles.consultationItemContent}>
              <p>산업기사, 기사 자격증</p>
              </div>
              <div className={styles.consultationItemContent}>
              <p>대학원 전학</p>
              </div>
              <div className={styles.consultationItemContent}>
              <p>영어 캠프</p>
              </div>
              <div className={styles.consultationItemContent}>
              <p>편입 공부</p>
              </div>
            </div>
            
      </div>
      <div className={styles.consultstudySection}>
              <img src="/book.png" alt="책" className={styles.consultationTitleImage} />
              <div className={styles.consultstudyTitle}>
                <p className={styles.consultstudyTitleText}>꼼꼼한 학습관리</p>
                <p className={styles.consultstudyTitleDescription}>시작뿐만 아니라 지속적으로 소통하여<br/>실제 목표까지 함께하여 누구나 시작은 어렵지만 성공 할 수 있어요.</p>
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={8}
                  slidesPerView={3.5}
                  breakpoints={{
                    320: {
                      slidesPerView: 1,
                      spaceBetween: 8,
                    },
                    417: {
                      slidesPerView: 3,
                      spaceBetween: 8,
                    },
                  }}
                  className={styles.swiperContainer}
                >
                  <SwiperSlide>
                    <img src="/swiper.png" alt="책" className={styles.swiperImage} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src="/swiper.png" alt="책" className={styles.swiperImage} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src="/swiper.png" alt="책" className={styles.swiperImage} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src="/swiper.png" alt="책" className={styles.swiperImage} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src="/swiper.png" alt="책" className={styles.swiperImage} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src="/swiper.png" alt="책" className={styles.swiperImage} />
                  </SwiperSlide>
                </Swiper>
              </div>
           
              </div>
              <div className={styles.consultstudySection}>
              <img src="/comment.png" alt="책" className={styles.consultationTitleImage} />
              <div className={styles.consultstudyTitle}>
                <p className={styles.consultstudyTitleText}>실시간 소통</p>
                <p className={styles.consultstudyTitleDescription}>시작뿐만 아니라 지속적으로 소통하며<br/>실제 목표까지 함께하여 누구나 시작은 어렵지만 성공할 수 있어요.</p>
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={8}
                  slidesPerView={3.5}
                  breakpoints={{
                    320: {
                      slidesPerView: 1,
                      spaceBetween: 8,
                    },
                    417: {
                      slidesPerView: 3,
                      spaceBetween: 8,
                    },
                  }}
                  className={styles.swiperContainer}
                >
                  <SwiperSlide>
                    <img src="/swiper.png" alt="책" className={styles.swiperImage} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src="/swiper.png" alt="책" className={styles.swiperImage} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src="/swiper.png" alt="책" className={styles.swiperImage} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src="/swiper.png" alt="책" className={styles.swiperImage} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src="/swiper.png" alt="책" className={styles.swiperImage} />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img src="/swiper.png" alt="책" className={styles.swiperImage} />
                  </SwiperSlide>
                </Swiper>
              </div>
              </div>
              <div className={styles.qnaSection}>
                <h1 className={styles.qnaTitle}>수린쌤에게 무료로<br/>교육컨설팅 받아보세요</h1>
                  <div className={styles.qnaContent}>
                    <div className={styles.qnaContentItem}>
                      <p className={styles.qnaContentItemText}><img width={20} height={20} src="/check.png" alt="질문" className={styles.qnaIcon} />1:1 개인별 맞춤 안내가 들어가요.</p>
                      <p className={styles.qnaContentItemText}><img width={20} height={20} src="/check.png" alt="질문" className={styles.qnaIcon} />원하는 일정에 맞춰 연락드려요.</p>
                      <p className={styles.qnaContentItemText}><img width={20} height={20} src="/check.png" alt="질문" className={styles.qnaIcon} />성적관리 확실히 도와드려요.</p>                    </div>
                  </div>

                </div>
      </section>
      
      </section>
    </div>
  );
}
