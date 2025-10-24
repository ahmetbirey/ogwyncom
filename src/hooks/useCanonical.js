import { useEffect } from 'react';

const useCanonical = (url) => {
  useEffect(() => {
    let link = document.querySelector("link[rel='canonical']");

    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }

    link.setAttribute('href', url);

  }, [url]);
};

export default useCanonical;
