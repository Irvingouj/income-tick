import { useEffect, useState } from "react";
import { useCurrentIncome } from "../routes/home";

interface RichPersonProps {
	name: string;
	imageUrl: string;
	annualIncome: number;
	startTime: number;
}

export default function RichPerson({
	name,
	imageUrl,
	annualIncome,
	startTime,
}: RichPersonProps) {
	const [isAnimating, setIsAnimating] = useState<boolean>(false);

	const earned = useCurrentIncome(annualIncome, startTime);

	const formatCurrency = (amount: number) => {
		// Use more decimals for per-second amounts which might be small
		const decimals = amount < 1 ? 5 : amount < 100 ? 2 : 2;

		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
		}).format(amount);
	};

	const calculatePerSecond = () => {
		return annualIncome / (365 * 24 * 60 * 60);
	};

	const calculatePerMinute = () => {
		return annualIncome / (365 * 24 * 60);
	};

	const calculatePerHour = () => {
		return annualIncome / (365 * 24);
	};

	const calculatePerDay = () => {
		return annualIncome / 365;
	};

	return (
		<div className="w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-border mb-8 hover:shadow-2xl transition-shadow duration-300">
			<div className="bg-foreground p-6">
				<div className="flex items-center mb-4">
					<img
						src={imageUrl}
						alt={name}
						className="w-16 h-16 rounded-full object-cover border-2 border-primary mr-4 shadow-md"
					/>
					<div>
						<h3 className="text-xl font-bold text-text-primary">{name}</h3>
						<p className="text-text-secondary text-sm">
							Annual income: {formatCurrency(annualIncome)}
						</p>
					</div>
				</div>

				<div
					className={`bg-gradient-to-r from-primary to-secondary rounded-lg p-4 mb-4 text-center shadow-lg text-white transition-transform duration-300 ${isAnimating ? "scale-[1.02]" : ""}`}
				>
					<h4 className="text-lg font-medium mb-1">
						Earned Since You Started
					</h4>
					<div className="text-3xl font-bold tracking-tight drop-shadow-sm">
						{formatCurrency(earned)}
					</div>
					<p className="text-xs mt-1 opacity-80">
						That's about {formatCurrency(calculatePerSecond())} per second
					</p>
				</div>

				<div className="grid grid-cols-3 gap-2 text-center">
					<div className="bg-input-background p-2 rounded-md border border-border">
						<div className="text-md font-bold text-primary">
							{formatCurrency(calculatePerSecond())}
						</div>
						<div className="text-xs text-text-secondary">per second</div>
					</div>
					<div className="bg-input-background p-2 rounded-md border border-border">
						<div className="text-md font-bold text-primary">
							{formatCurrency(calculatePerMinute())}
						</div>
						<div className="text-xs text-text-secondary">per minute</div>
					</div>
					<div className="bg-input-background p-2 rounded-md border border-border">
						<div className="text-md font-bold text-primary">
							{formatCurrency(calculatePerHour())}
						</div>
						<div className="text-xs text-text-secondary">per hour</div>
					</div>
				</div>
			</div>
		</div>
	);
}
