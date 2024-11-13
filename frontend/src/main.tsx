import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "./components/ui/tooltip.tsx";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: (retryCount, error) => {
				return false;
			},
		},
	},
});

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<App />
			</TooltipProvider>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	</React.StrictMode>,
);
