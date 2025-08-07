"use client";

import { Reservation, Table as TableType } from "@/app/page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Calendar, Clock, DollarSign, TrendingUp, Users } from "lucide-react";

interface AnalyticsProps {
	tables: TableType[];
	reservations: Reservation[];
}

export function Analytics({ tables, reservations }: AnalyticsProps) {
	const today = new Date().toISOString().split("T")[0];
	const todayReservations = reservations.filter((r) => r.date === today);

	// Статистика по времени
	const getTimeSlotStats = () => {
		const timeSlots = {};
		todayReservations.forEach((reservation) => {
			const hour = parseInt(reservation.time.split(":")[0]);
			const slot = `${hour}:00-${hour + 1}:00`;
			timeSlots[slot] = (timeSlots[slot] || 0) + 1;
		});
		return timeSlots;
	};

	// Средняя продолжительность обеда
	const getAverageDiningTime = () => {
		// берём занятие часы
		// считаем время вообще
		// суммируем
		// делим на общее
		const occupiedTables = tables.filter((t) => t.occupiedSince);
		if (occupiedTables.length === 0) return 0;

		const totalMinutes = occupiedTables.reduce((acc, table) => {
			const now = new Date();
			const diff = now.getTime() - table.occupiedSince!.getTime();
			return acc + Math.floor(diff / 60000);
			// в минутах
		}, 0);

		return Math.round(totalMinutes / occupiedTables.length);
	};

	// Статистика по статусам бронирований
	const getReservationStats = () => {
		return todayReservations.reduce((acc, reservation) => {
			acc[reservation.status] = (acc[reservation.status] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);
	};

	// Загруженность по часам
	const getPeakHours = () => {
		// создаём объект в виде ключей по часам
		const hourStats = {};
		todayReservations.forEach((reservation) => {
			const hour = parseInt(reservation.time.split(":")[0]);
			hourStats[hour] = (hourStats[hour] || 0) + reservation.partySize;
		});

		const sortedHours = Object.entries(hourStats)
			.sort(([, a], [, b]) => (b as number) - (a as number))
			.slice(0, 3);

		return sortedHours.map(([hour, guests]) => ({
			hour: `${hour}:00`,
			guests: guests as number,
		}));
	};

	const timeSlotStats = getTimeSlotStats();
	const averageDiningTime = getAverageDiningTime();
	const reservationStats = getReservationStats();
	const peakHours = getPeakHours();
	const totalGuests = todayReservations.reduce((acc, r) => acc + r.partySize, 0);
	const occupancyRate = Math.round(
		(tables.filter((t) => t.status === "occupied").length / tables.length) * 100,
	);

	return (
		<div className='space-y-6'>
			{/* Основные метрики */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Бронирований сегодня</CardTitle>
						<Calendar className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{todayReservations.length}</div>
						<p className='text-xs text-muted-foreground'>{totalGuests} гостей всего</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Загруженность</CardTitle>
						<TrendingUp className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{occupancyRate}%</div>
						<p className='text-xs text-muted-foreground'>
							{tables.filter((t) => t.status === "occupied").length} из {tables.length} столов
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Среднее время обеда</CardTitle>
						<Clock className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{averageDiningTime > 0
								? `${Math.floor(averageDiningTime / 60)}ч ${averageDiningTime % 60}м`
								: "N/A"}
						</div>
						<p className='text-xs text-muted-foreground'>По занятым столам</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Ежедневные заказы</CardTitle>
						<DollarSign className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>+12% </div>
						<p className='text-xs text-muted-foreground'>ко вчерашнему дню</p>
					</CardContent>
				</Card>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Часы пик */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<BarChart3 className='h-5 w-5' />
							Часы пик сегодня
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-3'>
							{peakHours.length > 0 ? (
								peakHours.map((peak, index) => (
									<div key={peak.hour} className='flex items-center justify-between'>
										<div className='flex items-center gap-2'>
											<Badge variant={index === 0 ? "default" : "secondary"}>#{index + 1}</Badge>
											<span className='font-medium'>{peak.hour}</span>
										</div>
										<div className='flex items-center gap-2'>
											<Users className='h-4 w-4 text-gray-400' />
											<span>{peak.guests} гостей</span>
										</div>
									</div>
								))
							) : (
								<p className='text-gray-500 text-center py-4'>Нет данных за сегодня</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Статистика бронирований */}
				<Card>
					<CardHeader>
						<CardTitle>Статус бронирований</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-3'>
							<div className='flex items-center justify-between'>
								<span>Подтверждено</span>
								<div className='flex items-center gap-2'>
									<Badge className='bg-blue-100 text-blue-800'>
										{reservationStats.confirmed || 0}
									</Badge>
								</div>
							</div>
							<div className='flex items-center justify-between'>
								<span>Посажены</span>
								<div className='flex items-center gap-2'>
									<Badge className='bg-green-100 text-green-800'>
										{reservationStats.seated || 0}
									</Badge>
								</div>
							</div>
							<div className='flex items-center justify-between'>
								<span>Завершено</span>
								<div className='flex items-center gap-2'>
									<Badge className='bg-gray-100 text-gray-800'>
										{reservationStats.completed || 0}
									</Badge>
								</div>
							</div>
							<div className='flex items-center justify-between'>
								<span>Отменено</span>
								<div className='flex items-center gap-2'>
									<Badge className='bg-red-100 text-red-800'>
										{reservationStats.cancelled || 0}
									</Badge>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Распределение по времени */}
			<Card>
				<CardHeader>
					<CardTitle>Распределение бронирований по времени</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
						{Object.entries(timeSlotStats).map(([timeSlot, count]) => (
							<div key={timeSlot} className='text-center p-3 bg-gray-50 rounded-lg'>
								<div className='text-sm font-medium text-gray-600'>{timeSlot}</div>
								<div className='text-2xl font-bold text-blue-600'>{count}</div>
								<div className='text-xs text-gray-500'>бронирований</div>
							</div>
						))}
					</div>
					{Object.keys(timeSlotStats).length === 0 && (
						<p className='text-gray-500 text-center py-8'>Нет бронирований на сегодня</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
