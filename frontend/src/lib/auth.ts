export interface User {
  id: number;
  email: string;
  role: 'customer' | 'employee' | 'supplier' | 'shipper';
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export const saveAuth = (data: AuthResponse) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const logout = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

export const getDashboardRoute = (role: string): string => {
  switch (role) {
    case 'customer': return '/dashboard/customer';
    case 'employee': return '/dashboard/employee';
    case 'supplier': return '/dashboard/supplier';
    case 'shipper': return '/dashboard/shipper';
    default: return '/login';
  }
};