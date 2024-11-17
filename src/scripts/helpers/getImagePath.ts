export const getImagePath = (name: string | null) =>
	name ? `http://localhost:8888/files/${name}` : undefined;
