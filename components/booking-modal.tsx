"use client";

import { Reservation, Table } from "@/app/page";
import { Alert, AlertDescription, AlertTriangle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface BookingModalProps {
	isOpen: boolean;
	onClose: () => void;
	table: Table | null;
	onCreateReservation: (reservation: Omit<Reservation, "id">) => void;
	onCheckConflict: (tableId: string, date: string, time: string) => boolean;
}

export function BookingModal({
	isOpen,
	onClose,
	table,
	onCreateReservation,
	onCheckConflict,
}: BookingModalProps) {
	const [formData, setFormData] = useState({
		guestName: "",
		phone: "",
		partySize: 2,
		date: new Date().toISOString().split("T")[0],
		time: "",
		specialRequests: "",
	});
	const [conflictError, setConflictError] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!table || !formData.guestName || !formData.phone || !formData.time) {
			return;
		}

		// Проверяем конфликт бронирования
		if (onCheckConflict(table.id, formData.date, formData.time)) {
			setConflictError("Этот стол уже забронирован на выбранное время!");
			return;
		}

		onCreateReservation({
			tableId: table.id,
			guestName: formData.guestName,
			phone: formData.phone,
			partySize: formData.partySize,
			date: formData.date,
			time: formData.time,
			specialRequests: formData.specialRequests,
			status: "confirmed",
		});

		// Сброс формы
		setFormData({
			guestName: "",
			phone: "",
			partySize: 2,
			date: new Date().toISOString().split("T")[0],
			time: "",
			specialRequests: "",
		});
		setConflictError("");

		onClose();
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
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Новое бронирование - Стол #{table?.number}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4'>
					{conflictError && (
						<Alert variant='destructive' className='mb-4'>
							<AlertTriangle className='h-4 w-4' />
							<AlertDescription>{conflictError}</AlertDescription>
						</Alert>
					)}

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<Label htmlFor='guestName'>Имя гостя *</Label>
							<Input
								id='guestName'
								value={formData.guestName}
								onChange={(e) => setFormData((prev) => ({ ...prev, guestName: e.target.value }))}
								placeholder='Введите имя'
								required
							/>
						</div>
						<div>
							<Label htmlFor='phone'>Телефон *</Label>
							<Input
								id='phone'
								type='tel'
								value={formData.phone}
								onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
								placeholder='+7 (999) 123-45-67'
								required
							/>
						</div>
					</div>

					<div className='grid grid-cols-3 gap-4'>
						<div>
							<Label htmlFor='partySize'>Количество гостей</Label>
							<Select
								value={formData.partySize.toString()}
								onValueChange={(value) =>
									setFormData((prev) => ({ ...prev, partySize: parseInt(value) }))
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{table &&
										Array.from({ length: table.seats }, (_, i) => (
											<SelectItem key={i + 1} value={(i + 1).toString()}>
												{i + 1}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor='date'>Дата *</Label>
							<Input
								id='date'
								type='date'
								value={formData.date}
								onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
								min={new Date().toISOString().split("T")[0]}
								required
							/>
						</div>
						<div>
							<Label htmlFor='time'>Время *</Label>
							<Select
								value={formData.time}
								onValueChange={(value) => setFormData((prev) => ({ ...prev, time: value }))}
							>
								<SelectTrigger>
									<SelectValue placeholder='Выберите время' />
								</SelectTrigger>
								<SelectContent>
									{timeSlots.map((time) => (
										<SelectItem key={time} value={time}>
											{time}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div>
						<Label htmlFor='specialRequests'>Особые пожелания</Label>
						<Textarea
							id='specialRequests'
							value={formData.specialRequests}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, specialRequests: e.target.value }))
							}
							placeholder='Столик у окна, детский стульчик и т.д.'
							rows={3}
						/>
					</div>

					<div className='flex gap-2 pt-4'>
						<Button type='button' variant='outline' onClick={onClose} className='flex-1'>
							Отмена
						</Button>
						<Button type='submit' className='flex-1'>
							Создать бронирование
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
