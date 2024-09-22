import  "@/styles/global.scss";
import HomePageView from "@/views/home.page.view";
import { redirect } from "next/navigation";

export default function Home() {

  return (

    <main>
      <HomePageView />
    </main>

  );

}
