type NotificationType = {
	id: number;
	type: number;
	user: number;
	friendRequest?: number;
	item?: number;
	createdAt: Date;
};

export default NotificationType;
