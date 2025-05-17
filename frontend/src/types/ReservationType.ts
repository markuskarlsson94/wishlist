type ReservationType = {
	id: number;
	user: number;
	item: number;
	createdAt: Date;
	owner: number;
	wishlist?: number;
};

export default ReservationType;
