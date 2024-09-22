import { FC } from "react";


export const StarIcon: FC<{ className?: string }> = ( { className } ) => {

  return (

    <svg className = { className } width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.507 18.2539L6.32636 21.5001L7.50701 14.6246L2.5 9.75577L9.40967 8.7554L12.5 2.50009L15.5903 8.7554L22.5 9.75577L17.493 14.6246L18.6736 21.5001L12.507 18.2539Z" fill="#E8A803" />
    </svg>

  );

}
