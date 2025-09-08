import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a10 10 0 0 0-7.53 16.59" />
      <path d="M12 2a10 10 0 0 1 7.53 16.59" />
      <path d="M12 2v10" />
      <path d="M6 8.5h12" />
      <path d="M9 13h6" />
      <path d="M10 17.5h4" />
    </svg>
  );
}
