'use client';
import { DetailedHTMLProps, FC, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import s from './input.module.scss';
import cssIf from '@/scripts/helpers/class.add.if';

interface InputProps {
	textareaParams: DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
	className?: string;
	label?: string;
	isRequired?: boolean;
	errMessage?: string;
}

const Textarea: FC<InputProps> = props => {
	const { textareaParams, className, label, isRequired, errMessage } = props;

	const { className: inputClassName, ...params } = textareaParams;

	return (
		<label className={`${s.wrapper} ${s.textarea} ${cssIf(!!className, className)}`}>
			{label && (
				<span className={s.label}>
					{label} {isRequired && <span>*</span>}
				</span>
			)}

			<textarea
				className={`${s.input} ${cssIf(!!inputClassName, inputClassName)}`}
				{...params}
			/>

			<span className={s.err}>{errMessage}</span>
		</label>
	);
};

export default Textarea;
