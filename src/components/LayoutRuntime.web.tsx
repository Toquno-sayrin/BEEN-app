import { useEffect } from 'react';

export function LayoutRuntime() {
  useEffect(() => {
    if (document.getElementById('been-layout-loader')) return;
    const base = new URL('./editor/', window.location.href);
    const model = document.createElement('script');
    model.id = 'been-layout-loader';
    model.src = new URL('model.js', base).href;
    model.onload = () => {
      const runtime = document.createElement('script');
      runtime.src = new URL('runtime.js', base).href;
      document.head.appendChild(runtime);
    };
    document.head.appendChild(model);
  }, []);
  return null;
}
