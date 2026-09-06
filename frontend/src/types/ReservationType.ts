type ReservationType = {
	id: number;
	user: number;
	item: number;
	createdAt: Date;
	owner: number;
	fulfilled?: boolean;
	wishlist?: number;
};

export default ReservationType;
