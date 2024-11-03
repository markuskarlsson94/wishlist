import { useNavigate } from "react-router-dom";
import { useDeleteReservation, useGetReservations } from "../hooks/reservation";
import { useAuth } from "../contexts/AuthContext";
import ReservationType from "../types/ReservationType";
import { useGetItem } from "../hooks/item";
import { NavLink } from "react-router-dom";
import RoundedRect from "./RoundedRect";

const ReservationItem = ({ reservation }: { reservation: ReservationType }) => {
	const { userId } = useAuth();
	const { item, isSuccess } = useGetItem(reservation.item);
	const deleteReservation = useDeleteReservation({ userId });

	if (!isSuccess || !item) return null;

	const handleDelete = () => {
		deleteReservation(reservation.id, item.id);
	};

	return (
		<div>
			<NavLink to={`/item/${item.id}`}>{item?.title}</NavLink>
			<button onClick={handleDelete}>Unreserve</button>
		</div>
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
			<h2>Reservations</h2>
			<button onClick={handleBack}>Back</button>
			{reservations?.map((reservation) => (
				<ReservationItem key={reservation.id} reservation={reservation} />
			))}
		</RoundedRect>
	);
};

export default Reservations;
