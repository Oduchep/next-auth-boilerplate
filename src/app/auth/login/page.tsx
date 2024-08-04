'use client';

import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

const Login = () => {
  const { data } = useSession();
  console.log(data);
  return <div>Login</div>;
};

export default Login;
