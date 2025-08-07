"use client";

import { Table } from "@/app/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Clock, Phone, User, Users } from "lucide-react";
import { useState } from "react";

interface TableFloorProps {
	tables: Table[];
	// onTableClick: (table: Table) => void;
	onTableStatusChange: (tableId: string, status: Table["status"]) => void;
	onWalkInSeating: (tableId: string, partySize: number) => void;
}

export function TableFloor({
	tables,
	// onTableClick,
	onTableStatusChange,
	onWalkInSeating,
}: TableFloorProps) {
	const [selectedTable, setSelectedTable] = useState<Table | null>(null);
	const [walkInPartySize, setWalkInPartySize] = useState<number>(2);

	const getTableColor = (status: Table["status"]) => {
		switch (status) {
			case "available":
				return "bg-green-100 border-green-300 hover:bg-green-200";
			case "occupied":
				return "bg-red-100 border-red-300";
			case "reserved":
				return "bg-blue-100 border-blue-300";
			case "cleaning":
				return "bg-yellow-100 border-yellow-300";
			default:
				return "bg-gray-100 border-gray-300";
		}
	};

	const getStatusText = (status: Table["status"]) => {
		switch (status) {
			case "available":
				return "Свободен";
			case "occupied":
				return "Занят";
			case "reserved":
				return "Забронирован";
			case "cleaning":
				return "Уборка";
			default:
				return "Неизвестно";
		}
	};

	const getOccupiedDuration = (occupiedSince?: Date) => {
		// расчёт сколько сидит посетитель
		if (!occupiedSince) return "";
		const now = new Date();
		const diff = now.getTime() - occupiedSince.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(minutes / 60);

		if (hours > 0) {
			return `${hours}ч ${minutes % 60}м`;
		}
		return `${minutes}м`;
	};

	const handleWalkIn = () => {
		// Посадить гостей
		// свободно
		if (selectedTable && selectedTable.status === "available") {
			onWalkInSeating(selectedTable.id, walkInPartySize);
			setSelectedTable(null);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>План этажа ресторана</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='relative bg-gray-50 rounded-lg p-8 min-h-[600px] border-2 border-dashed border-gray-200'>
					<div className='absolute top-4 right-4 bg-white p-4 rounded-lg shadow-sm border'>
						<h4 className='font-semibold mb-2'>Легенда:</h4>
						<div className='space-y-2 text-sm'>
							<div className='flex items-center gap-2'>
								<div className='w-4 h-4 bg-green-100 border border-green-300 rounded'></div>
								<span>Свободен</span>
							</div>
							<div className='flex items-center gap-2'>
								<div className='w-4 h-4 bg-red-100 border border-red-300 rounded'></div>
								<span>Занят</span>
							</div>
							<div className='flex items-center gap-2'>
								<div className='w-4 h-4 bg-blue-100 border border-blue-300 rounded'></div>
								<span>Забронирован</span>
							</div>
							<div className='flex items-center gap-2'>
								<div className='w-4 h-4 bg-yellow-100 border border-yellow-300 rounded'></div>
								<span>Уборка</span>
							</div>
						</div>
					</div>

					{/* Столы */}
					{tables.map((table) => (
						<Dialog key={table.id}>
							<DialogTrigger asChild>
								<div
									className={`absolute cursor-pointer transition-all duration-200 ${getTableColor(
										table.status,
									)}`}
									style={{
										left: `${table.position.x}px`,
										top: `${table.position.y}px`,
										width: "120px",
										height: "80px",
									}}
									onClick={() => setSelectedTable(table)}
								>
									<div className='w-full h-full border-2 rounded-lg p-2 flex flex-col justify-center items-center'>
										<div className='font-bold text-lg'>#{table.number}</div>
										<div className='text-xs flex items-center gap-1'>
											<Users className='h-3 w-3' />
											{table.seats}
										</div>
										<div className='text-xs mt-1'>{getStatusText(table.status)}</div>
										{table.occupiedSince && (
											<div className='text-xs text-red-600 flex items-center gap-1'>
												<Clock className='h-3 w-3' />
												{getOccupiedDuration(table.occupiedSince)}
											</div>
										)}
									</div>
								</div>
							</DialogTrigger>

							<DialogContent>
								<DialogHeader>
									<DialogTitle>Стол #{table.number}</DialogTitle>
								</DialogHeader>

								<div className='space-y-4'>
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<Label>Количество мест</Label>
											<div className='flex items-center gap-2 mt-1'>
												<Users className='h-4 w-4' />
												<span>{table.seats}</span>
											</div>
										</div>
										<div>
											<Label>Статус</Label>
											<div className='mt-1'>
												<Badge variant='secondary'>{getStatusText(table.status)}</Badge>
											</div>
										</div>
									</div>

									{table.occupiedSince && (
										<div>
											<Label>Время занятости</Label>
											<div className='flex items-center gap-2 mt-1'>
												<Clock className='h-4 w-4' />
												<span>{getOccupiedDuration(table.occupiedSince)}</span>
											</div>
										</div>
									)}

									{table.reservation && (
										<div className='border-t pt-4'>
											<Label>Информация о бронировании</Label>
											<div className='mt-2 space-y-2'>
												<div className='flex items-center gap-2'>
													<User className='h-4 w-4' />
													<span>{table.reservation.guestName}</span>
												</div>
												<div className='flex items-center gap-2'>
													<Phone className='h-4 w-4' />
													<span>{table.reservation.phone}</span>
												</div>
												<div className='flex items-center gap-2'>
													<Users className='h-4 w-4' />
													<span>{table.reservation.partySize} человек</span>
												</div>
												<div className='flex items-center gap-2'>
													<Clock className='h-4 w-4' />
													<span>{table.reservation.time}</span>
												</div>
											</div>
										</div>
									)}

									<div className='border-t pt-4'>
										<Label>Действия</Label>
										<div className='mt-2 space-y-2'>
											{table.status === "available" && (
												<>
													<div className='flex items-center gap-2'>
														<Label htmlFor='partySize'>Количество гостей:</Label>
														<Select
															value={walkInPartySize.toString()}
															onValueChange={(value) => setWalkInPartySize(parseInt(value))}
														>
															<SelectTrigger className='w-20'>
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																{Array.from({ length: table.seats }, (_, i) => (
																	<SelectItem key={i + 1} value={(i + 1).toString()}>
																		{i + 1}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
													<Button onClick={handleWalkIn} className='w-full'>
														Посадить гостей
													</Button>
												</>
											)}

											{table.status === "occupied" && (
												<Button
													onClick={() => onTableStatusChange(table.id, "cleaning")}
													variant='outline'
													className='w-full'
												>
													Освободить стол
												</Button>
											)}

											{table.status === "cleaning" && (
												<Button
													onClick={() => onTableStatusChange(table.id, "available")}
													className='w-full'
												>
													Уборка завершена
												</Button>
											)}

											{table.status === "reserved" && (
												<Button
													onClick={() => onTableStatusChange(table.id, "occupied")}
													className='w-full'
												>
													Посадить гостей
												</Button>
											)}
										</div>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					))}

					{/* Элементы интерьера */}
					<div className='absolute bottom-8 left-8 w-32 h-16 bg-amber-100 border-2 border-amber-300 rounded-lg flex items-center justify-center text-sm font-medium'>
						Бар
					</div>

					<div className='absolute top-1/2 left-8 w-16 h-32 bg-gray-200 border-2 border-gray-400 rounded-lg flex items-center justify-center text-sm font-medium transform -translate-y-1/2'>
						Вход
					</div>
					{/* в идеале сделать приближение */}
				</div>
			</CardContent>
		</Card>
	);
}
