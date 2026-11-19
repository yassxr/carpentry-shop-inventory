import { useRef, useCallback } from 'react';

export function useGroupHover() {
  const cleanupRef = useRef(null);

  return useCallback((el) => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (!el) return;

    const over = (e) => {
      const tr = e.target.closest('tr[data-group]');
      if (!tr) return;
      const group = tr.dataset.group;
      el.querySelectorAll('tr.row-hl').forEach(r => r.classList.remove('row-hl'));
      el.querySelectorAll(`tr[data-group="${group}"]`).forEach(r => r.classList.add('row-hl'));
    };
    const out = () => el.querySelectorAll('tr.row-hl').forEach(r => r.classList.remove('row-hl'));

    el.addEventListener('mouseover', over);
    el.addEventListener('mouseleave', out);
    cleanupRef.current = () => {
      el.removeEventListener('mouseover', over);
      el.removeEventListener('mouseleave', out);
    };
  }, []);
}
