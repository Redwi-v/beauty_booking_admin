'use client';
import { FC, useEffect, useState } from 'react';
import s from './image.input.module.scss';
import { PhotoIcon } from '@/components/images/photo';
import cssIf from '@/scripts/helpers/class.add.if';

interface ImageInputProps {
	selectedFile: File | null;
	setSelectedFile: (file: File | null) => void;
	className?: string;
	startPreview?: string;
}

const ImageInput: FC<ImageInputProps> = ({
	selectedFile,
	setSelectedFile,
	className,
	startPreview,
}) => {
	const [preview, setPreview] = useState<string | null>(null);

	// create a preview as a side effect, whenever selected file is changed
	useEffect(() => {
		if (!selectedFile) {
			setPreview(null);
			return;
		}

		const objectUrl = URL.createObjectURL(selectedFile);
		setPreview(objectUrl);

		// free memory when ever this component is unmounted
		return () => URL.revokeObjectURL(objectUrl);
	}, [selectedFile]);

	const onSelectFile = (e: any) => {
		if (!e.target.files || e.target.files.length === 0) {
			setSelectedFile(null);
			return;
		}

		// I've kept this example simple by using the first image instead of multiple
		setSelectedFile(e.target.files[0]);
	};

	return (
		<label className={`${cssIf(!!className, className)} ${s.content}`}>
			<input
				type='file'
				onChange={onSelectFile}
			/>

			{selectedFile && preview && <img src={preview || startPreview} />}
			{!selectedFile && startPreview && <img src={preview || startPreview} />}
			<PhotoIcon className={cssIf(!!!preview && !startPreview, s.show)} />
		</label>
	);
};

export default ImageInput;
