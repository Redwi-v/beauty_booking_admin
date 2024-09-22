import { FC, PropsWithChildren } from 'react'
import s from './text.module.scss'
import cssIf from '@/scripts/helpers/class.add.if'

interface defaultProps extends PropsWithChildren {

  className?: string

}

export const P: FC<  defaultProps & { small?: boolean }  > = ({ children, className, small }) => {

  return (

    <p className = {`${ s.p } ${ className } ${ cssIf( !!small, s.small ) }`}>{ children }</p>

  )

} 

export const H1: FC<  defaultProps  > = ({ children, className }) => {

  return (

    <h1 className = {`${ s.h1 } ${ className }`}>{ children }</h1>

  )

} 

export const H2: FC<  defaultProps  > = ({ children, className }) => {

  return (

    <h2 className = {`${ s.h2 } ${ className }`}>{ children }</h2>

  )

} 