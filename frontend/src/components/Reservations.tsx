import { useNavigate } from "react-router-dom";
import { useDeleteReservation, useGetReservations } from "../hooks/reservation";
import { useAuth } from "../contexts/AuthContext";
import ReservationType from "../types/ReservationType";
import { useGetItem } from "../hooks/item";
import { NavLink } from "react-router-dom";
import RoundedRect from "./RoundedRect";
import BackButton from "./BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

const ReservationItem = ({ reservation }: { reservation: ReservationType }) => {
	const { userId } = useAuth();
	const { item, isSuccess } = useGetItem(reservation.item);
	const deleteReservation = useDeleteReservation({ userId });

	if (!isSuccess || !item) return null;

	const handleDelete = () => {
		deleteReservation(reservation.id, item.id);
	};

	return (
		<NavLink to={`/item/${item.id}`}>
			<Card>
				<CardHeader>
					<CardTitle>{item?.title}</CardTitle>
				</CardHeader>
				<CardContent>
					<Button onClick={handleDelete}>Unreserve</Button>
				</CardContent>
			</Card>
		</NavLink>
	);
};

const Reservations = () => {
	const { userId } = useAuth();
	const { reservations } = useGetReservations(userId);
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	return (
		<RoundedRect>
			<BackButton onClick={handleBack} />
			{reservations?.map((reservation) => (
				<ReservationItem key={reservation.id} reservation={reservation} />
			))}
		</RoundedRect>
	);
};

export default Reservations;
