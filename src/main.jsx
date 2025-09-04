import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import Provider from "./store/provider";
// import { getMoonpayKeyByEnv } from "./helpers/moonpay";
// import { getIsTestnetEnv } from "helpers/env";
// import { MoonPayProvider } from "@moonpay/moonpay-react";

createRoot(document.getElementById("root")).render(
	// <MoonPayProvider apiKey={getMoonpayKeyByEnv()} debug={getIsTestnetEnv()}>
	<BrowserRouter>
		<Provider>
			<StrictMode>
				<App />
			</StrictMode>
		</Provider>
	</BrowserRouter>
	// </MoonPayProvider>
);
