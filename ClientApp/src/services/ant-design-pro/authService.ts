import httpClient from '../httpService';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return httpClient.get('/currentUser', { ...options });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return httpClient.post('/outLogin', { ...options });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return httpClient.post('/token', body, {
    headers: {
      tenant: 'root',
      ...(options?.headers || {}),
    },
    ...options,
  });
}

export async function resetPassword(
  body: { password: string; email: string; token: string },
  options?: { [key: string]: any },
) {
  return httpClient.post('/users/reset-password', body, {
    headers: {
      tenant: 'root',
      ...(options?.headers || {}),
    },
    ...options,
  });
}

export async function forgotPassword(body: { email: string }, options?: { [key: string]: any }) {
  return httpClient.post('/users/forgot-password', body, {
    headers: {
      tenant: 'root',
      ...(options?.headers || {}),
    },
    ...options,
  });
}

export async function refreshJWToken(
  options?: { [key: string]: any },
) {
  return httpClient.post('/token/refresh', null, {
    headers: {
      tenant: 'root',
      ...(options?.headers || {}),
    },
    ...options,
  });
}
