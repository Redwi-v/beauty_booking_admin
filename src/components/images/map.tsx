import { FC } from "react";


export const MapIcon: FC<{ className?: string }> = ( { className } ) => {

  return (
    <svg className ={className} width="5666" height="1150" viewBox="0 0 5666 1150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2475.62 9L740.842 805.138L9 1141H3190.38L5657 9H2475.62Z" stroke="#0B86BB" stroke-width="17" stroke-linejoin="round" />
      <path d="M3044.5 14.5L873 1131.5H1343.5L3441.5 14.5H3044.5Z" fill="#0B86BB" stroke="black" stroke-linejoin="round" />
      <path d="M4107.5 712.5H946.5L1115 637.5H4295L4107.5 712.5Z" fill="#0B86BB" stroke="#0B86BB" stroke-linejoin="round" />
    </svg>
  );

}
