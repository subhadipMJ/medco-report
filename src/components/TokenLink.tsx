import { Link, LinkProps, useLocation } from 'react-router-dom';

export function TokenLink({ to, ...props }: LinkProps) {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  let toWithToken = to;
  if (token && typeof to === 'string' && !to.includes('token=')) {
    const separator = to.includes('?') ? '&' : '?';
    toWithToken = `${to}${separator}token=${encodeURIComponent(token)}`;
  }

  return <Link to={toWithToken} {...props} />;
}
