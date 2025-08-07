"use client";

import { Reservation, Table as TableType } from "@/app/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Clock, Edit, Phone, Plus, Search, Trash2, Users } from "lucide-react";
import { useState } from "react";
import EditReservations from "./edit-reservations";
import { NewReservationModal } from "./new-reservations";

interface ReservationsListProps {
	reservations: Reservation[];
	tables: TableType[];
	onReservationUpdate: (reservations: Reservation[]) => void;
	onCheckConflict: (tableId: string, date: string, time: string, excludeId?: string) => boolean;
}

export function ReservationsList({
	reservations,
	tables,
	onReservationUpdate,
	onCheckConflict,
}: ReservationsListProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isNewModalOpen, setIsNewModalOpen] = useState(false);
	const [editForm, setEditForm] = useState<Partial<Reservation>>({});
	const [newReservationForm, setNewReservationForm] = useState({
		guestName: "",
		phone: "",
		partySize: 2,
		tableId: "",
		date: new Date().toISOString().split("T")[0],
		time: "",
		specialRequests: "",
	});
	const [conflictError, setConflictError] = useState("");

	const filteredReservations = reservations.filter(
		(reservation) =>
			reservation.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			reservation.phone.includes(searchTerm),
	);

	const getStatusBadge = (status: Reservation["status"]) => {
		const variants = {
			confirmed: {
				variant: "default" as const,
				text: "Забронировано",
				color: "bg-blue-100 text-blue-800",
			},
			seated: {
				variant: "secondary" as const,
				text: "Посажены",
				color: "bg-green-100 text-green-800",
			},
			completed: {
				variant: "outline" as const,
				text: "Завершено",
				color: "bg-gray-100 text-gray-800",
			},
			cancelled: {
				variant: "destructive" as const,
				text: "Отменено",
				color: "bg-red-100 text-red-800",
			},
		};

		const config = variants[status];
		return (
			<Badge variant={config.variant} className={config.color}>
				{config.text}
			</Badge>
		);
	};

	const getTableNumber = (tableId: string) => {
		const table = tables.find((t) => t.id === tableId);
		return table ? table.number : "N/A";
	};

	const getAvailableTablesForTime = (date: string, time: string, excludeReservationId?: string) => {
		return tables.filter((table) => {
			// Проверяем, что стол не забронирован на это время
			const hasConflict = onCheckConflict(table.id, date, time, excludeReservationId);
			return !hasConflict && table.seats >= newReservationForm.partySize;
		});
	};

	const handleEdit = (reservation: Reservation) => {
		setSelectedReservation(reservation);
		setEditForm(reservation);
		setIsEditModalOpen(true);
		setConflictError("");
	};

	const handleSaveEdit = () => {
		if (!selectedReservation || !editForm) return;

		// Проверяем конфликт только если изменились стол, дата или время
		if (
			editForm.tableId !== selectedReservation.tableId ||
			editForm.date !== selectedReservation.date ||
			editForm.time !== selectedReservation.time
		) {
			if (
				onCheckConflict(editForm.tableId!, editForm.date!, editForm.time!, selectedReservation.id)
			) {
				setConflictError("Этот стол уже забронирован на выбранное время!");
				return;
			}
		}

		const updatedReservations = reservations.map((r) =>
			r.id === selectedReservation.id ? { ...r, ...editForm } : r,
		);
		onReservationUpdate(updatedReservations);
		setIsEditModalOpen(false);
		setSelectedReservation(null);
		setEditForm({});
		setConflictError("");
	};

	const handleDelete = (reservationId: string) => {
		const updatedReservations = reservations.filter((r) => r.id !== reservationId);
		onReservationUpdate(updatedReservations);
	};

	const handleStatusChange = (reservationId: string, newStatus: Reservation["status"]) => {
		const updatedReservations = reservations.map((r) =>
			r.id === reservationId ? { ...r, status: newStatus } : r,
		);
		console.log("🚀 ~  ~ ReservationsList ~ updatedReservations:", updatedReservations);
		onReservationUpdate(updatedReservations);
	};

	const handleCreateNew = () => {
		if (
			!newReservationForm.guestName ||
			!newReservationForm.phone ||
			!newReservationForm.time ||
			!newReservationForm.tableId
		) {
			setConflictError("Пожалуйста, заполните все обязательные поля!");
			return;
		}

		// Проверяем конфликт бронирования
		if (
			onCheckConflict(newReservationForm.tableId, newReservationForm.date, newReservationForm.time)
		) {
			setConflictError("Этот стол уже забронирован на выбранное время!");
			return;
		}

		const newReservation: Reservation = {
			id: Date.now().toString(),
			tableId: newReservationForm.tableId,
			guestName: newReservationForm.guestName,
			phone: newReservationForm.phone,
			partySize: newReservationForm.partySize,
			date: newReservationForm.date,
			time: newReservationForm.time,
			specialRequests: newReservationForm.specialRequests,
			status: "confirmed",
		};

		onReservationUpdate([...reservations, newReservation]);
		setIsNewModalOpen(false);
		setNewReservationForm({
			guestName: "",
			phone: "",
			partySize: 2,
			tableId: "",
			date: new Date().toISOString().split("T")[0],
			time: "",
			specialRequests: "",
		});
		setConflictError("");
	};

	const timeSlots = [
		"12:00",
		"12:30",
		"13:00",
		"13:30",
		"14:00",
		"14:30",
		"15:00",
		"15:30",
		"16:00",
		"16:30",
		"17:00",
		"17:30",
		"18:00",
		"18:30",
		"19:00",
		"19:30",
		"20:00",
		"20:30",
		"21:00",
		"21:30",
		"22:00",
	];

	return (
		<Card>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<CardTitle>Список бронирований</CardTitle>
					<Button onClick={() => setIsNewModalOpen(true)}>
						<Plus className='h-4 w-4 mr-2' />
						Новое бронирование
					</Button>
				</div>
				<div className='flex items-center gap-2'>
					<div className='relative flex-1 max-w-sm'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
						<Input
							placeholder='Поиск по имени или телефону...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='pl-10'
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className='rounded-md border'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Гость</TableHead>
								<TableHead>Телефон</TableHead>
								<TableHead>Стол</TableHead>
								<TableHead>Гости</TableHead>
								<TableHead>Дата и время</TableHead>
								<TableHead>Статус</TableHead>
								<TableHead>Действия</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredReservations.map((reservation) => (
								<TableRow key={reservation.id}>
									<TableCell className='font-medium'>{reservation.guestName}</TableCell>
									<TableCell>
										<div className='flex items-center gap-2'>
											<Phone className='h-4 w-4 text-gray-400' />
											{reservation.phone}
										</div>
									</TableCell>
									<TableCell>
										<Badge variant='outline'>Стол #{getTableNumber(reservation.tableId)}</Badge>
									</TableCell>
									<TableCell>
										<div className='flex items-center gap-2'>
											<Users className='h-4 w-4 text-gray-400' />
											{reservation.partySize}
										</div>
									</TableCell>
									<TableCell>
										<div className='flex items-center gap-2'>
											<Clock className='h-4 w-4 text-gray-400' />
											{new Date(reservation.date).toLocaleDateString("ru-RU")} {reservation.time}
										</div>
									</TableCell>
									<TableCell>
										<Select
											value={reservation.status}
											onValueChange={(value: Reservation["status"]) => {
												handleStatusChange(reservation.id, value);
											}}
										>
											<SelectTrigger className='w-32'>
												{getStatusBadge(reservation.status)}
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='confirmed'>Подтверждено</SelectItem>
												<SelectItem value='seated'>Посажены</SelectItem>
												<SelectItem value='completed'>Завершено</SelectItem>
												<SelectItem value='cancelled'>Отменено</SelectItem>
											</SelectContent>
										</Select>
									</TableCell>
									<TableCell>
										<div className='flex items-center gap-2'>
											<Button variant='ghost' size='sm' onClick={() => handleEdit(reservation)}>
												<Edit className='h-4 w-4' />
											</Button>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => handleDelete(reservation.id)}
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{filteredReservations.length === 0 && (
					<div className='text-center py-8 text-gray-500'>
						{searchTerm ? "Бронирования не найдены" : "Нет бронирований"}
					</div>
				)}
			</CardContent>

			{/* Модальное окно редактирования */}
			<EditReservations
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setSelectedReservation(null);
				}}
				editForm={editForm}
				setEditForm={setEditForm}
				conflictError={conflictError}
				setConflictError={setConflictError}
				timeSlots={timeSlots}
				selectedReservation={selectedReservation}
				tables={tables}
				getAvailableTablesForTime={getAvailableTablesForTime}
				onSave={handleSaveEdit}
			/>

			{/* Модальное окно создания нового бронирования */}
			<NewReservationModal
				isOpen={isNewModalOpen}
				onClose={() => setIsNewModalOpen(false)}
				newReservationForm={newReservationForm}
				setNewReservationForm={setNewReservationForm}
				conflictError={conflictError}
				setConflictError={setConflictError}
				timeSlots={timeSlots}
				tables={tables}
				getAvailableTablesForTime={getAvailableTablesForTime}
				onCreate={handleCreateNew}
			/>
		</Card>
	);
}
