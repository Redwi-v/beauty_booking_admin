import { FC } from "react";
import s from './checkbox.module.scss'
import cssIf from "@/scripts/helpers/class.add.if";

interface CheckboxProps {

  checked: boolean,
  setChecked: ( value: boolean ) => void
  label: string

}

const Checkbox: FC<CheckboxProps> = ( { checked, setChecked, label } ) => {

  return (

    <button onClick={ () => setChecked( !checked ) } className={ s.wrapper }>
      <div className={ `${ s.checkbox } ${ cssIf( checked, s.checked ) }` }>

        <span></span>

      </div>

      <span>{ label }</span>
      
    </button>

  );

}

export default Checkbox;