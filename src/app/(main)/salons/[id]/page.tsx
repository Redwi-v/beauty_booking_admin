import SalonPageView from "@/views/salon.page.view";
import { FC } from "react";

interface SalonProps {
  
  params: {
    id: string
  }

}
 
const Salon: FC<SalonProps> = ({ params }) => {

  const { id } = params

  return ( 

    <>
      <SalonPageView id = { +id }/>
    </>

  );

}
 
export default Salon;