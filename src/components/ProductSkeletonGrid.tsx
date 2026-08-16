import React from 'react';

interface ProductSkeletonGridProps {
  count?: number;
}

export const ProductSkeletonGrid: React.FC<ProductSkeletonGridProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#241E1B] rounded-2xl p-3 sm:p-4 border border-[#EBE6DD] dark:border-[#3D322B] flex flex-col justify-between"
        >
          <div>
            {/* Image Box Skeleton */}
            <div className="aspect-square rounded-xl bg-[#EFECE6] dark:bg-[#2E2622] mb-3 sm:mb-4" />

            {/* Category Tag Skeleton */}
            <div className="h-3 w-16 bg-[#EFECE6] dark:bg-[#2E2622] rounded-md mb-2" />

            {/* Title Skeleton */}
            <div className="h-4 sm:h-5 w-4/5 bg-[#EFECE6] dark:bg-[#2E2622] rounded-md mb-2" />

            {/* Subtitle Skeleton */}
            <div className="h-3 w-3/5 bg-[#EFECE6] dark:bg-[#2E2622] rounded-md" />
          </div>

          {/* Price & Action Skeleton */}
          <div className="pt-3 mt-4 border-t border-[#F2EFE9] dark:border-[#3D322B] flex items-center justify-between">
            <div className="h-5 sm:h-6 w-20 bg-[#EFECE6] dark:bg-[#2E2622] rounded-md" />
            <div className="w-9 h-9 rounded-full bg-[#EFECE6] dark:bg-[#2E2622]" />
          </div>
        </div>
      ))}
    </div>
  );
};
