import { useEffect, useMemo, useState } from "react";
import RichPerson from "../components/RichPerson";
import type { Route } from "./+types/home";

// Custom hooks
function useLocalStorageState<T>(
	key: string,
	initialValue: T,
): [T, (value: T) => void] {
	const [state, setState] = useState<T>(() => {
		const storedValue = window.localStorage.getItem(key);
		return storedValue ? JSON.parse(storedValue) : initialValue;
	});

	useEffect(() => {
		window.localStorage.setItem(key, JSON.stringify(state));
	}, [key, state]);

	return [state, setState];
}

export const useCurrentIncome = (
	annualIncome: number,
	since: number | null,
) => {
	const [currentTime, setCurrentTime] = useState<number>(Date.now());

	useEffect(() => {
		const intervalId = setInterval(() => {
			setCurrentTime(Date.now());
		}, 100);
		return () => clearInterval(intervalId);
	}, []);

	const earned = useMemo(() => {
		if (!since) return 0;
		const timeElapsed = currentTime - since;
		const incomePerMs = annualIncome / (365 * 24 * 60 * 60 * 1000);
		return timeElapsed * incomePerMs;
	}, [annualIncome, since, currentTime]);

	return earned;
};

function useIncomeTracker(
	initialIncome: number,
	initialStartTime: Date | null,
	initialIsRunning: boolean,
) {
	const [income, setIncome] = useLocalStorageState<number>(
		"income",
		initialIncome || 0,
	);
	const [isRunning, setIsRunning] = useLocalStorageState<boolean>(
		"isRunning",
		initialIsRunning || false,
	);
	const [startTime, setStartTime] = useLocalStorageState<number | null>(
		"startTime",
		initialStartTime ? Number(initialStartTime) : null,
	);

	useEffect(() => {
		if (income > 0 && startTime) {
			setIsRunning(true);
		}
	}, [income, startTime, setIsRunning]);

	const handleStart = () => {
		setIsRunning(!isRunning);
		setStartTime(Date.now());
	};

	const handleReset = () => {
		setIsRunning(false);
		setStartTime(null);
		setIncome(0);
	};

	const earned = useCurrentIncome(income, startTime);

	return {
		income,
		setIncome,
		isRunning,
		earned,
		startTime,
		handleStart,
		handleReset,
	};
}

function useCustomPeople() {
	const [customPeople, setCustomPeople] = useState<
		Array<{ name: string; imageUrl: string; annualIncome: number }>
	>([]);

	return { customPeople, setCustomPeople };
}

function useFormatCurrency() {
	return (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);
	};
}

export async function clientLoader() {
	const income = window.localStorage.getItem("income");
	const startTime = window.localStorage.getItem("startTime");
	const isRunning = window.localStorage.getItem("isRunning");

	return {
		income: income ? JSON.parse(income) : 0,
		startTime: startTime ? new Date(JSON.parse(startTime)) : null,
		isRunning: isRunning ? JSON.parse(isRunning) : false,
	};
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const {
		income: storedIncome,
		startTime: storedStartTime,
		isRunning: storedIsRunning,
	} = loaderData;

	const {
		income,
		setIncome,
		isRunning,
		earned,
		startTime,
		handleStart,
		handleReset,
	} = useIncomeTracker(storedIncome, storedStartTime, storedIsRunning);

	const formatCurrency = useFormatCurrency();

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
			<div className="w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-border mb-8">
				<div className="p-8 bg-foreground">
					<h1
						className="text-3xl font-bold text-center mb-8 text-primary"
						hidden={isRunning}
					>
						Income Ticker
					</h1>

					<div className="mb-6">
						<label
							htmlFor="income"
							className="block text-sm font-medium mb-2 text-text-secondary"
						>
							Annual Income
						</label>
						<div className="relative mt-1 rounded-md shadow-sm">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<span className="sm:text-sm text-text-secondary">$</span>
							</div>
							<input
								type="number"
								name="income"
								id="income"
								disabled={isRunning}
								className="block w-full pl-7 pr-12 py-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary border border-border bg-input-background text-text-primary"
								placeholder="0.00"
								aria-describedby="income-currency"
								value={income || ""}
								onChange={(e) => setIncome(Number(e.target.value))}
							/>
							<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
								<span
									className="sm:text-sm text-text-secondary"
									id="income-currency"
								>
									USD
								</span>
							</div>
						</div>
					</div>

					<div
						hidden={!isRunning}
						className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 mb-8 text-center shadow-lg text-white"
					>
						<h2 className="text-lg font-medium mb-2">
							Earned So since {new Date(startTime || 0).toLocaleString()}
						</h2>
						<div className="text-4xl font-bold tracking-tight drop-shadow-sm">
							{formatCurrency(earned)}
						</div>
						{isRunning && (
							<p className="mt-2 text-sm opacity-90">
								Ticking since {new Date(startTime || 0).toLocaleTimeString()}
							</p>
						)}
					</div>

					<div className="flex gap-3">
						<button
							hidden={isRunning}
							type="button"
							onClick={handleStart}
							className={`flex-1 py-3 px-4 rounded-md shadow-sm font-medium ${
								isRunning
									? "bg-secondary text-white hover:bg-opacity-90"
									: "bg-primary text-white hover:bg-opacity-90"
							} ${
								income <= 0 && !isRunning
									? "opacity-50 cursor-not-allowed"
									: "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
							}`}
							disabled={income <= 0 && !isRunning}
						>
							{isRunning ? "Pause" : "Start"}
						</button>
						<button
							type="button"
							onClick={handleReset}
							className="flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm font-medium bg-button-secondary text-text-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
						>
							Reset
						</button>
					</div>
				</div>
			</div>

			{isRunning && startTime && (
				<div>
					<h2 className="text-2xl font-bold text-primary mb-6">
						Compare to Famous People
					</h2>
					<RichPerson
						name="Elon Musk"
						imageUrl="https://upload.wikimedia.org/wikipedia/commons/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg"
						annualIncome={147000000000} // $147 billion per year
						startTime={startTime}
					/>

					<RichPerson
						name="Jeff Bezos"
						imageUrl="https://upload.wikimedia.org/wikipedia/commons/0/03/Jeff_Bezos_visits_LAAFB_SMC_%283908618%29_%28cropped%29.jpeg"
						annualIncome={10000000000} // $10 billion per year
						startTime={startTime}
					/>

					<RichPerson
						name="Mark Zuckerberg"
						imageUrl="https://upload.wikimedia.org/wikipedia/commons/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg"
						annualIncome={2000000000} // $2 billion per year
						startTime={startTime}
					/>
				</div>
			)}
		</div>
	);
}
