import { useCallback } from 'react';
import { useNavigate, useLocation, To } from 'react-router-dom';

export function useNavigateWithToken() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  return useCallback(
    (to: To | number, options?: { replace?: boolean; state?: unknown }) => {
      if (typeof to === 'number') {
        navigate(to);
        return;
      }

      const toStr = typeof to === 'string' ? to : `${to.pathname || ''}${to.search || ''}${to.hash || ''}`;
      const [pathname, search = ''] = toStr.split('?');
      const urlSearch = new URLSearchParams(search);

      if (token && !urlSearch.has('token')) {
        urlSearch.set('token', token);
      }

      const newSearch = urlSearch.toString();
      const newTo = newSearch ? `${pathname}?${newSearch}` : pathname;

      navigate(newTo, options);
    },
    [navigate, token],
  );
}

export function getUrlWithToken(url: string, token: string | null): string {
  if (!token) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}
