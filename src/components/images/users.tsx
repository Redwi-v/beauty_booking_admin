import { FC } from "react";


export const UsersIcon: FC<{ className?: string }> = ( { className } ) => {

  return (

    <svg className={ className } width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.66667 13.3C8.96785 13.3 10.8333 11.4345 10.8333 9.13331C10.8333 6.83212 8.96785 4.96664 6.66667 4.96664C4.36548 4.96664 2.5 6.83212 2.5 9.13331C2.5 11.4345 4.36548 13.3 6.66667 13.3Z" stroke="#0FA3E2" stroke-width="1.5" stroke-miterlimit="10" />
      <path d="M0.833344 16.6333C1.4913 15.6036 2.36478 14.7632 3.38004 14.1831C4.3953 13.6029 5.52253 13.3 6.66656 13.3C7.81059 13.2999 8.93785 13.6027 9.95314 14.1828C10.9684 14.7629 11.842 15.6032 12.5 16.6328" stroke="#0FA3E2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M13.3333 13.3C15.6345 13.3 17.5 11.4345 17.5 9.13331C17.5 6.83212 15.6345 4.96664 13.3333 4.96664" stroke="#0FA3E2" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M13.3332 13.3C14.4773 13.2999 15.6045 13.6027 16.6198 14.1828C17.6351 14.7629 18.5086 15.6032 19.1667 16.6328" stroke="#0FA3E2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

  );

}
