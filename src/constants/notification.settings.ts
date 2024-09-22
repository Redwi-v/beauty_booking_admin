import { iNotification } from 'react-notifications-component' 
export const notificationSettings: iNotification = {

  title: "Wonderful!",
  message: "teodosii@react-notifications-component",
  type: "success",
  insert: "top",
  container: "top-full",
  animationIn: ["animate__animated", "animate__fadeIn"],
  animationOut: ["animate__animated", "animate__fadeOut"],

  dismiss: {
    
    duration: 2400,
    onScreen: true
    
  }

}
