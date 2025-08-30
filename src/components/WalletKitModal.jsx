import { HOTWALLET_ID } from "@creit.tech/stellar-wallets-kit";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { WalletKitService } from "services/globalServices";

import ArrowRightIcon from "assets/icon-arrow-right.svg";

import ExternalLink from "./ExternalLink";
import Label from "./Label";
import { ModalTitle, ModalWrapper } from "./ModalAtoms";

import {
	LoginMethod,
	LoginMethodDescription,
	LoginMethodName,
	LoginMethodWithDescription,
} from "./ChooseLoginMethodModal";

const ArrowRight = styled(ArrowRightIcon)`
	margin-left: auto;
	min-width: 1.6rem;
`;

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
		<ModalWrapper>
			<ModalTitle>Stellar Wallet Kit</ModalTitle>

			{params.modules.map(
				({ productName, productIcon, productUrl, productId }) => (
					<LoginMethod
						key={productName}
						onClick={() => {
							if (isAvailableMap && !isAvailableMap.get(productName)) {
								return;
							}
							close();
							WalletKitService.login(productId);
						}}
					>
						<img src={productIcon} alt={productName} width={40} height={40} />
						<LoginMethodWithDescription>
							<LoginMethodName>
								{productName}{" "}
								{productId === HOTWALLET_ID && <Label labelText="NEW!" />}
							</LoginMethodName>
							{isAvailableMap && !isAvailableMap.get(productName) && (
								<LoginMethodDescription>
									<ExternalLink href={productUrl}>Install</ExternalLink>
								</LoginMethodDescription>
							)}
						</LoginMethodWithDescription>

						<ArrowRight />
					</LoginMethod>
				)
			)}
		</ModalWrapper>
	);
};

export default WalletKitModal;
