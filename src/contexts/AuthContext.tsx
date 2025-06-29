'use client'; // 이 파일은 클라이언트 컴포넌트에서 사용될 것이므로 'use client' 지시문이 필요합니다.

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js'; // Supabase User 타입 임포트
import { supabase } from '@/lib/supabaseClient'; // 클라이언트 Supabase 인스턴스 임포트

// UserContext의 타입을 정의합니다.
// User 객체 또는 null을 가질 수 있습니다.
interface UserContextType {
  user: User | null;
  loading: boolean;
}

// UserContext를 생성하고 기본값을 설정합니다.
// 기본값은 초기 상태를 나타냅니다.
const UserContext = createContext<UserContextType | undefined>(undefined);

// AuthProvider 컴포넌트 정의
// 이 컴포넌트는 자식 컴포넌트들에게 인증 상태를 제공합니다.
interface AuthProviderProps {
  children: ReactNode; // ReactNode는 모든 유효한 React 자식을 나타냅니다.
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // 현재 로그인한 사용자 정보
  const [loading, setLoading] = useState(true); // 인증 상태 로딩 중 여부

  useEffect(() => {
    // Supabase 인증 상태 변화를 감지하는 리스너를 설정합니다.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // 세션이 존재하면 사용자 정보를 설정하고, 그렇지 않으면 null로 설정합니다.
        setUser(session?.user || null);
        setLoading(false); // 로딩 완료
      }
    );

    // 컴포넌트 언마운트 시 리스너를 정리합니다.
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // 빈 의존성 배열은 컴포넌트가 마운트될 때 한 번만 실행되도록 합니다.

  // Context Provider를 통해 user와 loading 상태를 자식 컴포넌트들에게 제공합니다.
  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// useUser 커스텀 훅 정의
// 이 훅을 사용하여 어떤 컴포넌트에서든 현재 사용자 정보에 접근할 수 있습니다.
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    // AuthProvider 내에서 사용되지 않으면 에러를 발생시킵니다.
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context.user; // 사용자 객체만 반환합니다.
};

// useAuthStatus 커스텀 훅 정의 (선택 사항: 로딩 상태도 필요할 경우)
// 이 훅을 사용하여 인증 상태와 로딩 상태에 접근할 수 있습니다.
export const useAuthStatus = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useAuthStatus must be used within an AuthProvider');
  }
  return { user: context.user, loading: context.loading };
};
