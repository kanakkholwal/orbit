/** What an `image` render prop or snippet receives; spread it onto your framework's image component. */
export interface ImageSlotProps {
	src: string;
	alt: string;
	width?: number;
	height?: number;
	className?: string;
	loading?: "lazy" | "eager";
}
