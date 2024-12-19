import { useEffect, useState } from 'react';
import prand from 'prando';

const modules = import.meta.glob('./../assets/birds/*.png');

export const useRandomProfileImage = (seed: string) => {
  const [image, setImage] = useState();
  const images = Object.entries(modules);
  useEffect(() => {
    const loadImage = async () => {
      const rng = new prand(seed.toLowerCase());

      const rnd = rng.nextInt(0, images.length - 1);
      const img = (await images[rnd][1]()) as any;
      setImage(img.default);
    };
    loadImage();
  }, [images, seed]);

  return image;
};
