import React from 'react';
import { OptimizedImage, OptimizedImageProps } from './OptimizedImage';

export const Image: React.FC<OptimizedImageProps> = (props) => {
  return <OptimizedImage {...props} />;
};

export default Image;
export { OptimizedImage };
export type { OptimizedImageProps };
