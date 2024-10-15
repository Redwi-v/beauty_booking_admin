import Image from 'next/image';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import s from './checkbox.module.scss';

interface ICheckboxProps {
	className?: string;
	isActive?: boolean;
	onClick?: () => void;
}

export const CheckBox: FC<ICheckboxProps> = ({ className, isActive, onClick }) => {
	return (
		<button
			className={`${s.check_box} ${isActive && s.active} ${className}`}
			onClick={() => onClick?.()}
		></button>
	);
};
