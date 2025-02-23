import { FC } from 'react';
import s from './home.page.view.module.scss'
import Link from 'next/link';
import { LogoIcon, MapIcon, MapPointIcon, ScissorsIcon } from '@/components/images';
import 'animate.css'
import Image from 'next/image';

interface IHomePageViewProps {

}

const HomePageView: FC<IHomePageViewProps> = ( props ) => {

  const { } = props

  return (

    <div className='container'>

      <div className={ s.main_info }>

        <h1 className={`${ s.title } animate__animated animate__delay-1s animate__fadeInDown`}>
          <LogoIcon />
          BeautyBooking
        </h1>
        <p className={`${ s.sub_title } animate__animated animate__delay-2s animate__fadeInDown`}>Сервис для записи в салоны красоты</p>
        {/* <Link href={ 'https://t.me/beauty_booking123123_bot' } className={ `${ s.link } ${ s.admin } animate__animated animate__delay-2s animate__fadeInDown` } >
          Записатся
        </Link> */}
        <Link href={ '/login' } className={ `${ s.link } ${ s.telegram } animate__animated animate__delay-2s animate__fadeInDown` } >
          Для владельцев салона
        </Link>


        <div className={ `${ s.map_points }` }>
          <MapPointIcon className='animate__animated animate__wobble animate__infinite animate__slower animate__delay-1s ' />
          <MapPointIcon className='animate__animated animate__bounce animate__infinite animate__slower animate__delay-1s' />
          <MapPointIcon className='animate__animated animate__wobble animate__infinite animate__slower' />
          <MapPointIcon className='animate__animated animate__bounce animate__infinite animate__slower animate__delay-2s' />
          <MapPointIcon className='animate__animated animate__bounce animate__infinite animate__slower animate__delay-3s' />
        </div>

      </div>

    </div>

  )

}


export default HomePageView