import { useEffect, useRef, useState, useCallback } from "react";
import Cropper, { Point, Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUser, useRemoveProfilePicture, useSetProfilePicture, useUseGoogleProfilePicture } from "@/hooks/user";
import ProfilePicture from "./ProfilePicture";
import { Info } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./ui/alert-dialog";
import { AxiosError } from "axios";

const ProfilePictureDialog = () => {
	const minZoom = 1;
	const maxZoom = 5;
	const maxMB = 20;
	const maxSize = maxMB * 1024 * 1024;

	const { userId } = useAuth();
	const { user } = useGetUser(userId);
	const [open, setOpen] = useState<boolean>(false);
	const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
	const [zoom, setZoom] = useState<number>(minZoom);
	const [file, setFile] = useState<string | undefined>(undefined);
	const [error, setError] = useState<string | undefined>(undefined);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | undefined>(undefined);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [shwowErrorDialog, setShowErrorDialog] = useState<boolean>(false);

	const { setProfilePicture, isPending: isPendingUpload } = useSetProfilePicture({
		onSuccess: () => {
			setFile(undefined);
			if (fileInputRef.current) fileInputRef.current.value = "";
			setOpen(false);
		},
		onError: (_error: AxiosError) => {
			setFile(undefined);
			if (fileInputRef.current) fileInputRef.current.value = "";
			setOpen(false);
			setShowErrorDialog(true);
		},
	});

	const { removeProfilePicture, isPending: isPendingRemove } = useRemoveProfilePicture({
		onSuccess: () => {
			setFile(undefined);
			if (fileInputRef.current) fileInputRef.current.value = "";
			setOpen(false);
		},
		onError: (_error: AxiosError) => {
			setOpen(false);
			setShowErrorDialog(true);
		},
	});

	const { useGoogleProfilePicture } = useUseGoogleProfilePicture();

	const userHasProfilePicture = !!user?.profilePicture;
	const isPending = isPendingUpload || isPendingRemove;
	let pendingMessage;

	if (isPendingUpload) {
		pendingMessage = "Uploading image...";
	} else if (isPendingRemove) {
		pendingMessage = "Removing profile picture...";
	}

	useEffect(() => {
		return () => {
			if (file) {
				URL.revokeObjectURL(file);
				setZoom(minZoom);
			}
		};
	}, [file]);

	const handleDeleteProfilePicture = () => {
		if (!userId) return;

		removeProfilePicture(userId);
	};

	const handleUpload = async () => {
		if (!userId || !file || !croppedAreaPixels) return;
		const downloadPicture = false;

		try {
			const croppedImage = await getCroppedImg(file, croppedAreaPixels);
			setProfilePicture(userId, croppedImage);

			if (downloadPicture) {
				const url = URL.createObjectURL(croppedImage);
				const a = document.createElement("a");
				a.href = url;
				a.download = "cropped.jpeg";
				a.click();
				URL.revokeObjectURL(url);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
		setCroppedAreaPixels(croppedAreaPixels);
	}, []);

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={(open) => {
					if (!open) {
						setFile(undefined);
						setError(undefined);
					}

					setOpen(open);
				}}
			>
				<DialogTrigger asChild>
					<Button>Update Profile Picture</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Update profile picture</DialogTitle>
					</DialogHeader>
					<div className="relative w-[100%] h-[22rem]">
						{isPending ? (
							<div className="flex h-full">
								<p className="m-auto font-medium text-gray-500">{pendingMessage}</p>
							</div>
						) : (
							<>
								{file ? (
									<Cropper
										image={file}
										crop={crop}
										zoom={zoom}
										onCropChange={setCrop}
										onZoomChange={setZoom}
										onCropComplete={onCropComplete}
										aspect={1}
										cropShape="round"
										showGrid={false}
										maxZoom={maxZoom}
									/>
								) : (
									<div className="flex h-full">
										{userHasProfilePicture ? (
											<ProfilePicture src={user.profilePicture} className="m-auto h-64 w-64" />
										) : (
											<p className="m-auto text-2xl font-medium text-gray-300">
												No profile picture
											</p>
										)}
									</div>
								)}
							</>
						)}
					</div>

					{file ? (
						<div className="flex w-full">
							<div className="flex flex-col gap-y-3 w-full">
								<div className="flex gap-x-3 w-full items-center z-10">
									<Label className="mb-[0.2rem]">Zoom:</Label>
									<Slider
										defaultValue={[minZoom]}
										value={[zoom]}
										min={minZoom}
										max={maxZoom}
										step={0.001}
										onValueChange={(value: number[]) => setZoom(value[0])}
										disabled={isPending}
									/>
								</div>
								<div className="flex gap-x-3 ml-auto">
									<Button
										variant={"secondary"}
										onClick={() => {
											setFile(undefined);
											setError(undefined);
										}}
										disabled={isPending}
									>
										Cancel
									</Button>
									<Button
										variant={"secondary"}
										onClick={() => {
											fileInputRef.current?.click();
										}}
										disabled={isPending}
									>
										Select another image
									</Button>
									<Button onClick={handleUpload} disabled={isPending}>
										Confirm
									</Button>
								</div>
							</div>
						</div>
					) : (
						<div className="flex">
							<div className="flex gap-x-3 ml-auto">
								{userHasProfilePicture ? (
									<>
										<Button
											variant={"secondary"}
											onClick={handleDeleteProfilePicture}
											disabled={isPending}
										>
											Remove
										</Button>
										<Button onClick={() => fileInputRef.current?.click()} disabled={isPending}>
											Update
										</Button>
									</>
								) : (
									<>
										{user?.isGoogleUser && userId && (
											<Button
												variant={"secondary"}
												onClick={() => useGoogleProfilePicture(userId)}
											>
												Use Google profile picture
											</Button>
										)}
										<Button onClick={() => fileInputRef.current?.click()} disabled={isPending}>
											Select image
										</Button>
									</>
								)}
							</div>
						</div>
					)}

					{error && (
						<div className="flex flex-row items-center gap-x-2 mx-auto">
							<Info opacity={0.7} />
							<p className="font-medium text-sm text-red-500">Error: {error}</p>
						</div>
					)}
				</DialogContent>
			</Dialog>

			<Input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={(e) => {
					const file = e.target.files?.[0];
					setError(undefined);

					if (file) {
						if (!file.type.startsWith("image/")) {
							if (fileInputRef.current) {
								fileInputRef.current.value = "";
							}

							return setError("Unsupported file format");
						}

						if (file.size > maxSize) {
							if (fileInputRef.current) {
								fileInputRef.current.value = "";
							}

							return setError(`Image size exceeds ${maxMB} MB`);
						}

						const imageUrl = URL.createObjectURL(file);
						setFile(imageUrl);
					}
				}}
			/>

			<AlertDialog open={shwowErrorDialog} onOpenChange={setShowErrorDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Error</AlertDialogTitle>
					</AlertDialogHeader>
					<AlertDialogDescription>Unable to update profile picture</AlertDialogDescription>
					<AlertDialogFooter>
						<AlertDialogAction>Close</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

const getCroppedImg = async (imageSrc: string, crop: Area): Promise<File> => {
	const image = await loadImage(imageSrc);
	const canvas = document.createElement("canvas");
	canvas.width = crop.width;
	canvas.height = crop.height;
	const ctx = canvas.getContext("2d");

	if (ctx) {
		ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
	}

	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (!blob) return reject(new Error("Canvas is empty"));
			resolve(new File([blob], "cropped.jpeg", { type: "image/jpeg" }));
		}, "image/jpeg");
	});
};

const loadImage = (imageSrc: string): Promise<CanvasImageSource> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = imageSrc;
	});
};

export default ProfilePictureDialog;
