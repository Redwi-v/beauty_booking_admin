import { FC } from "react";


export const ArrowIcon: FC<{ className?: string }> = ( { className } ) => {

  return (

    <svg className={ className } width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 21.2L10.5 14.2L17.5 7.20001" stroke="#333333" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

  );

}
