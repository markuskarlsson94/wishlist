import { useGetUser, useSearchUser } from "@/hooks/user";
import Searchbar from "./Searchbar";
import { useEffect, useRef, useState } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { Button } from "./ui/button";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProfilePicture from "./ProfilePicture";

const UserSearchBar = () => {
	const [query, setQuery] = useState<string>("");
	const [queryCount, setQueryCount] = useState<number>(0);
	const [resultsOpen, setResultsOpen] = useState<boolean>(false);
	const [disabled, setDisabled] = useState<boolean>(true);
	const { userId: viewer } = useAuth();
	const { users, isFetching, isSuccess, hasNextPage, fetchNextPage } = useSearchUser(query);
	const searchBarRef = useRef<HTMLDivElement>(null);
	const loadMoreRef = useRef<HTMLDivElement>(null);

	const maxHeight = 360;

	const handleSearch = (input: string) => {
		setQuery(input);
		setQueryCount((prev) => prev + 1);
	};

	const handleChange = (input: string) => {
		if (input.length < 3) {
			setDisabled(true);
			setResultsOpen(false);
		} else {
			setDisabled(false);
		}
	};

	const handleKeyDown = (key: string) => {
		if (key === "Escape") {
			setResultsOpen(false);
		}
	};

	const handleClear = () => {
		setResultsOpen(false);
	};

	const handleInteractOutside = (target: any) => {
		setResultsOpen(searchBarRef.current?.contains(target) ?? false);
	};

	useEffect(() => {
		if (isSuccess && users) {
			setResultsOpen(true);
		}
	}, [isSuccess, queryCount]);

	const User = ({ id }: { id: number }) => {
		const { user } = useGetUser(id);

		if (!user || !viewer) return;

		return (
			<div>
				<NavLink to={`/user/${id}`} onClick={() => setResultsOpen(false)}>
					<div className="flex px-3 py-2 hover:bg-gray-100 items-center gap-3">
						<ProfilePicture src={user.profilePicture} className="w-8 h-8" />
						<p className="truncate text-sm md:text-base">
							{user.firstName} {user.lastName} {viewer === id ? "(You)" : ""}
						</p>
					</div>
				</NavLink>
			</div>
		);
	};

	const SearchResult = () => {
		return (
			<>
				<div className="flex flex-col gap-y-2">
					{users.map((userId) => (
						<div key={userId}>
							<User key={userId} id={userId} />
						</div>
					))}
				</div>
				{users.length === 0 && (
					<div className="flex">
						<p className="m-auto text-muted-foreground">No results</p>
					</div>
				)}
				{hasNextPage && (
					<div className="flex pt-2" ref={loadMoreRef}>
						<Button
							onClick={() => fetchNextPage()}
							disabled={isFetching}
							variant={"secondary"}
							className="m-auto"
						>
							{isFetching ? "Loading..." : "Load more"}
						</Button>
					</div>
				)}
			</>
		);
	};

	return (
		<div>
			<Popover open={resultsOpen}>
				<div ref={searchBarRef}>
					<Searchbar
						placeholder="Search for user"
						onSearch={handleSearch}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						onClear={handleClear}
						disabled={disabled}
					/>
				</div>
				<PopoverAnchor />
				<PopoverContent
					className="w-64 md:w-80 shadow-2xl"
					onOpenAutoFocus={(e) => e.preventDefault()}
					onInteractOutside={(e) => handleInteractOutside(e.target)}
					onKeyDown={(e) => handleKeyDown(e.key)}
				>
					<div
						style={{ maxHeight: `${maxHeight}px` }}
						className="overflow-y-auto pr-2 md:[&::-webkit-scrollbar]:w-2 md:[&::-webkit-scrollbar-track]:bg-gray-100
  md:[&::-webkit-scrollbar-thumb]:bg-gray-300"
					>
						<SearchResult />
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default UserSearchBar;
