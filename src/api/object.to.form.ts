export const objectToForm = (body: { [key: string]: any }) => {
	const dataForm = new FormData();
	for (let key in body) {
		//@ts-ignore

		if (body[key] === undefined) {
		} else {
			dataForm.append(key, body[key]);
		}
	}

	return dataForm;
};
