import { getSession } from 'next-auth/react';

type fetcherArgs = [reqInfo: RequestInfo | URL, init?: RequestInit | undefined];

// Default response props
export type ResProps<T = null> = {
  success?: boolean;
  message?: string;
  data: T;
  error?: Error;
};

// Global fetcher fn
export const fetchReq = async <T>(...args: fetcherArgs) => {
  const [info, init = {}] = args;

  const session = await getSession();

  if (session) {
    init.headers = {
      Authorization: `Bearer ${session.access_token}`,
      ...init.headers,
    };
  }

  return fetch(info, init)
    .then((res) => res.json() as T)
    .catch((err) => ({ error: err })) as Promise<ResProps<T>>;
};

// Global default post fetch fn
export const postReq = <T>(...args: fetcherArgs) => {
  const [info, init] = args;

  return fetchReq<T>(info, {
    method: 'POST',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  }) as Promise<ResProps<T>>;
};

// For patch requests
export const patchReq = <T>(...args: fetcherArgs) => {
  const [info, init] = args;

  return fetchReq<T>(info, {
    method: 'PATCH',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  }) as Promise<ResProps<T>>;
};

// Delete requests handler fn
export const deleteReq = <T>(...args: fetcherArgs) => {
  const [info, init] = args;

  return fetchReq<T>(info, {
    method: 'DELETE',
    ...init,
    headers: {
      ...init?.headers,
    },
  }) as Promise<ResProps<T>>;
};
