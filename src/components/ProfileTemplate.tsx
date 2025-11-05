'use client';

import Image from 'next/image';
import { User } from '@/types/user';
import Link from 'next/link';
import { canEdit, getCurrentUser, signOut } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
          
          <div className={styles.heroContent}>
            <p className={styles.nameTag}>에듀바이저 {user.name}</p>
            <h1>교육과정 처음부터<br />끝까지 함께하겠습니다.</h1>
            <div className={styles.whyChooseContent}>
              <p className={styles.whyChooseContentText}>
                교육 컨설팅 전문가 한평생
              </p>
              <p className={styles.whyChooseContentsummary}>
              누적 학생수 000명 · 학생 만족도 98%
              </p>
              <div className={styles.whyChooseContentSummaryBox}>
                <p className={styles.whyChooseContentSummaryText}>
                  공식플래너
                </p>
                <p className={styles.whyChooseContentSummaryText}>
                  8년차 전문가
                </p>
                <p className={styles.whyChooseContentSummaryText}>
                  1:1 맞춤상담
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      
      <section className={styles.contentsSection}>
      
        <div className={styles.contentsTitle}>

          <h1>
            한평생 에듀바이저스와<br/>
            함께라면 다릅니다.
          </h1>
        </div>
        
         
      </section>

      
      

    
    </div>
  );
}
