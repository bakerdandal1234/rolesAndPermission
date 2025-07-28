import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { user, loading, checkSession } = useAuthStore();

  useEffect(() => {
    // الكوكيز مُرسَلة الآن من السيرفر، فتكفي هذه الدعوة
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!loading) {
      if (user) navigate('/dashboard');
      else       navigate('/login?error=auth_failed');
    }
  }, [loading, user, navigate]);

  return <p>Authenticating...</p>;
};

export default AuthSuccess;
