export const getImagePath = (name: string | null) =>
	name ? `${process.env.API_URL}/files/${name}` : undefined;
