import { HOTWALLET_ID } from "@creit.tech/stellar-wallets-kit";
import { useEffect, useState } from "react";

import { WalletKitService } from "services/globalServices";

import { IoIosArrowForward } from "react-icons/io";

import { FaLongArrowAltRight } from "react-icons/fa";

const WalletKitModal = ({ params, close }) => {
	const [isAvailableMap, setIsAvailableMap] = useState(null);

	const { modules } = params;

	useEffect(() => {
		Promise.all(modules.map(({ isAvailable }) => isAvailable())).then(
			(results) => {
				const map = new Map();

				results.forEach((isAvailable, index) => {
					map.set(modules[index].productName, isAvailable);
				});

				setIsAvailableMap(map);
			}
		);
	}, [modules]);

	return (
		<div className="overflow-y-auto h-full">
			<h1 className="mb-4 text-2xl">Stellar Wallet Kit</h1>

			{params.modules.map(
				({ productName, productIcon, productUrl, productId }) => (
					<div
						className={`flex items-center justify-between p-4 rounded-2xl bg-gray-100 mb-2 cursor-pointer`}
						key={productName}
						onClick={() => {
							if (isAvailableMap && !isAvailableMap.get(productName)) {
								return;
							}
							close();
							WalletKitService.login(productId);
						}}
					>
						<div className="flex items-center gap-2">
							<img src={productIcon} alt={productName} width={30} height={30} />
							<div>
								<p>
									{productName}{" "}
									{/* {productId === HOTWALLET_ID && <Label labelText="NEW!" />} */}
								</p>
								{isAvailableMap && !isAvailableMap.get(productName) && (
									<div className="flex items-center">
										<a href={productUrl}>Install</a>
										<FaLongArrowAltRight />
									</div>
								)}
							</div>
						</div>

						<IoIosArrowForward />
					</div>
				)
			)}
		</div>
	);
};

export default WalletKitModal;
