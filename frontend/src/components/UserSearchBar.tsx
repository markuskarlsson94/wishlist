import { useGetUser, useSearchUser } from "@/hooks/user";
import Searchbar from "./Searchbar";
import { useEffect, useRef, useState } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { Button } from "./ui/button";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "./ui/scroll-area";

const UserSearchBar = () => {
	const [query, setQuery] = useState<string>("");
	const [queryCount, setQueryCount] = useState<number>(0);
	const [resultsOpen, setResultsOpen] = useState<boolean>(false);
	const [resultsHeight, setResultsHeight] = useState<number>(0);
	const [disabled, setDisabled] = useState<boolean>(true);
	const { userId: viewer } = useAuth();
	const { users, isFetching, isSuccess, hasNextPage, fetchNextPage } = useSearchUser(query);
	const searchBarRef = useRef<HTMLDivElement>(null);
	const userRef = useRef<HTMLDivElement>(null);
	const loadMoreRef = useRef<HTMLDivElement>(null);

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

	useEffect(() => {
		if (userRef.current && loadMoreRef.current) {
			setResultsHeight(userRef.current.offsetHeight * 10 + loadMoreRef.current.offsetHeight);
		}
	}, [users]);

	const User = ({ id }: { id: number }) => {
		const { user } = useGetUser(id);

		if (!user || !viewer) return;

		return (
			<div>
				<NavLink to={`/user/${id}`} onClick={() => setResultsOpen(false)}>
					<p className="px-3 py-2 hover:bg-gray-100">
						{user.firstName} {user.lastName} {viewer === id ? "(You)" : ""}
					</p>
				</NavLink>
			</div>
		);
	};

	const SearchResult = () => {
		return (
			<>
				{users.map((userId, index) => (
					<div key={userId} ref={index === 0 ? userRef : null}>
						<User key={userId} id={userId} />
					</div>
				))}
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
					className="w-80 shadow-2xl"
					onOpenAutoFocus={(e) => e.preventDefault()}
					onInteractOutside={(e) => handleInteractOutside(e.target)}
					onKeyDown={(e) => handleKeyDown(e.key)}
				>
					{users.length >= 10 ? (
						<ScrollArea
							style={{
								height: users.length > 10 ? `${resultsHeight}px` : "auto",
							}}
						>
							<SearchResult />
						</ScrollArea>
					) : (
						<SearchResult />
					)}
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default UserSearchBar;
