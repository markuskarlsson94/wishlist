import { useNavigate } from "react-router-dom";
import { useDeleteReservation, useGetReservations } from "../hooks/reservation";
import { useAuth } from "../contexts/AuthContext";
import ReservationType from "../types/ReservationType";
import { useGetItem } from "../hooks/item";
import { NavLink } from "react-router-dom";
import RoundedRect from "./RoundedRect";
import BackButton from "./BackButton";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { Button, buttonVariants } from "./ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./ui/alert-dialog";

const ReservationItem = ({ reservation }: { reservation: ReservationType }) => {
	const { userId } = useAuth();
	const { item, isSuccess } = useGetItem(reservation.item);
	const deleteReservation = useDeleteReservation({ userId });

	if (!isSuccess || !item) return null;

	const handleDelete = () => {
		deleteReservation(reservation.id, item.id);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between">
					<NavLink to={`/item/${item.id}`}>
						<CardTitle>{item?.title}</CardTitle>
					</NavLink>

					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button>Unreserve</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Remove reservation?</AlertDialogTitle>
								<AlertDialogDescription>
									Removing the reservation will let other users reserve the item.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									className={buttonVariants({ variant: "destructive" })}
									onClick={() => handleDelete()}
								>
									Remove
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</CardHeader>
		</Card>
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
			<div className="flex flex-col gap-y-3">
				<BackButton onClick={handleBack} />
				{reservations.length === 0 && (
					<div className="flex">
						<p className="m-auto text-2xl font-medium text-gray-300">No reservations</p>
					</div>
				)}
				{reservations?.map((reservation) => (
					<ReservationItem key={reservation.id} reservation={reservation} />
				))}
			</div>
		</RoundedRect>
	);
};

export default Reservations;
