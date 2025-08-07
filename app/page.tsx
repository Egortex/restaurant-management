"use client";

import { Analytics } from "@/components/analytics";
import { BookingModal } from "@/components/booking-modal";
import { ReservationsList } from "@/components/reservations-list";
import StatisticCard from "@/components/statistic-card";
import { TableFloor } from "@/components/table-floor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calendar, Users } from "lucide-react";
import { useEffect, useState } from "react";

export interface Table {
	id: string;
	number: number;
	seats: number;
	// мест
	status: "available" | "occupied" | "reserved" | "cleaning";
	position: { x: number; y: number };
	reservation?: Reservation;
	occupiedSince?: Date;
	// когда занято
}

export interface Reservation {
	id: string;
	tableId: string;
	guestName: string;
	phone: string;
	partySize: number;
	date: string;
	time: string;
	specialRequests?: string;
	status: "confirmed" | "seated" | "completed" | "cancelled";
}

const initialTables: Table[] = [
	{ id: "1", number: 1, seats: 2, status: "available", position: { x: 120, y: 50 } },
	{
		id: "2",
		number: 2,
		seats: 4,
		status: "occupied",
		position: { x: 280, y: 50 },
		occupiedSince: new Date(Date.now() - 30 * 60000),
	},
	{ id: "3", number: 3, seats: 6, status: "cleaning", position: { x: 440, y: 50 } },
];

const initialReservations: Reservation[] = [
	{
		id: "1754569695443",
		tableId: "2",
		guestName: "Гость 5443",
		phone: "",
		partySize: 2,
		date: "2025-08-07",
		time: "15:28",
		status: "seated",
	},
];

export default function RestaurantManagement() {
	const [tables, setTables] = useState<Table[]>(initialTables);
	const [reservations, setReservations] = useState<Reservation[]>(initialReservations);

	useEffect(() => {
		console.log("🚀 ~  ~ TableFloor ~ tables:", tables);
	}, [tables]);

	useEffect(() => {
		console.log("🚀 ~  ~ TableFloor ~ reservations:", reservations);
	}, [reservations]);

	const handleTableStatusChange = (tableId: string, newStatus: Table["status"]) => {
		// обновление
		setTables((prev) =>
			prev.map((table) =>
				table.id === tableId
					? {
							...table,
							status: newStatus,
							occupiedSince: newStatus === "occupied" ? new Date() : undefined,
					  }
					: table,
			),
		);
	};

	const checkReservationConflict = (
		tableId: string,
		date: string,
		time: string,
		excludeId?: string,
	) => {
		return reservations.some(
			(reservation) =>
				reservation.tableId === tableId &&
				reservation.date === date &&
				reservation.time === time &&
				reservation.status !== "cancelled" &&
				reservation.status !== "completed" &&
				reservation.id !== excludeId,
		);
	};

	const handleReservationUpdate = (updatedReservations: Reservation[]) => {
		setReservations(updatedReservations);

		// Обновляем статусы столов на основе бронирований
		setTables((prev) =>
			prev.map((table) => {
				const activeReservation = updatedReservations.find(
					(r) =>
						r.tableId === table.id &&
						r.date === new Date().toISOString().split("T")[0] &&
						(r.status === "confirmed" || r.status === "seated"),
				);

				if (activeReservation) {
					return {
						...table,
						status: activeReservation.status === "seated" ? "occupied" : "reserved",
						reservation: activeReservation,
					};
				} else if (
					table.status === "reserved" ||
					(table.status === "occupied" && table.reservation)
				) {
					// Освобождаем стол если нет активного бронирования
					return {
						...table,
						status: "available",
						reservation: undefined,
						occupiedSince: undefined,
					};
				}

				return table;
			}),
		);
	};

	const handleWalkInSeating = (tableId: string, partySize: number) => {
		const guestName = `Гость ${Date.now().toString().slice(-4)}`;
		const walkInReservation: Reservation = {
			id: Date.now().toString(),
			tableId,
			guestName,
			phone: "",
			partySize,
			date: new Date().toISOString().split("T")[0],
			time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
			status: "seated",
		};

		setReservations((prev) => [...prev, walkInReservation]);
		handleTableStatusChange(tableId, "occupied");
	};

	const getStatusStats = () => {
		const stats = tables.reduce((acc, table) => {
			acc[table.status] = (acc[table.status] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return {
			available: stats.available || 0,
			occupied: stats.occupied || 0,
			reserved: stats.reserved || 0,
			cleaning: stats.cleaning || 0,
			total: tables.length,
		};
	};

	const stats = getStatusStats();

	return (
		<div className='min-h-screen bg-gray-50 p-4'>
			<div className='max-w-7xl mx-auto'>
				<div className='mb-6'>
					<h1 className='text-3xl font-bold text-gray-900 mb-2'>Управление столиками</h1>
				</div>

				<StatisticCard stats={stats} />
				{/*  */}
				<Tabs defaultValue='floor' className='w-full'>
					<TabsList className='grid w-full grid-cols-3'>
						<TabsTrigger value='floor' className='flex items-center gap-2'>
							<Users className='h-4 w-4' />
							План этажа
						</TabsTrigger>
						<TabsTrigger value='reservations' className='flex items-center gap-2'>
							<Calendar className='h-4 w-4' />
							Бронирования
						</TabsTrigger>
						<TabsTrigger value='analytics' className='flex items-center gap-2'>
							<BarChart3 className='h-4 w-4' />
							Аналитика
						</TabsTrigger>
					</TabsList>
					{/*  */}
					<TabsContent value='floor' className='mt-6'>
						<TableFloor
							tables={tables}
							onTableStatusChange={handleTableStatusChange}
							onWalkInSeating={handleWalkInSeating}
						/>
					</TabsContent>
					{/*  */}
					<TabsContent value='reservations' className='mt-6'>
						<ReservationsList
							reservations={reservations}
							tables={tables}
							onReservationUpdate={handleReservationUpdate}
							onCheckConflict={checkReservationConflict}
						/>
					</TabsContent>
					{/*  */}
					<TabsContent value='analytics' className='mt-6'>
						<Analytics tables={tables} reservations={reservations} />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
