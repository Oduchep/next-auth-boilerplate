import { axiosRequest, getBaseUrl } from '@/app/lib/common';
import * as Yup from 'yup';

// Form Validator schema
export interface SigninFormSchema {
  email: string;
  password: string;
  rememberLogin?: boolean;
}

// Response from a successful sign in
export interface SignInAPIResponse {
  token: string;
}

// Form validation schema
export const signInSchema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().required().min(8),
  rememberLogin: Yup.boolean(),
});

// User sign in request
export const signInUser = (userData: SigninFormSchema) => {
  const URL = `${getBaseUrl()}/pharm-portal/auth/login`;

  const { email, password } = userData;
  const reqBody = { body: JSON.stringify({ email, password }) };

  return axiosRequest.post<SignInAPIResponse>(URL, reqBody);
};
