import { FC } from "react";


export const ListIcon: FC<{ className?: string }> = ( { className } ) => {

  return (

    <svg className={ className } width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.11111" y="2.22223" width="4.44444" height="4.44444" stroke="#0FA3E2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <rect x="1.11111" y="13.3333" width="4.44444" height="4.44444" stroke="#0FA3E2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M10 2.22223H18.8889" stroke="#0FA3E2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M10 6.66669H14.4444" stroke="#0FA3E2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M10 13.3333H18.8889" stroke="#0FA3E2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M10 17.7778H14.4444" stroke="#0FA3E2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

  );

}
