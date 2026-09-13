import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures that whenever a user navigates to a new route in the SPA,
 * the scroll position resets to the top and accessibility focus is directed
 * to the main page heading, while preserving scroll position on 'POP' (Back/Forward) actions.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    // Only reset scroll on PUSH or REPLACE (forward navigation), not on POP (browser Back)
    if (navType !== 'POP' || prevPathnameRef.current !== pathname) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });

      // Move accessibility focus to the main page header or main container
      requestAnimationFrame(() => {
        const heading = document.querySelector('main h1, main h2, [data-page-title]');
        if (heading) {
          heading.setAttribute('tabIndex', '-1');
          heading.focus({ preventScroll: true });
        }
      });
    }

    prevPathnameRef.current = pathname;
  }, [pathname, navType]);

  return null;
};
