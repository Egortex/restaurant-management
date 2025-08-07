"use client";

import { Table as TableType } from "@/app/page";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { AlertTriangle } from "lucide-react";

interface NewReservationModalProps {
	isOpen: boolean;
	onClose: () => void;
	newReservationForm: {
		guestName: string;
		phone: string;
		partySize: number;
		tableId: string;
		date: string;
		time: string;
		specialRequests: string;
	};
	setNewReservationForm: (form: NewReservationModalProps["newReservationForm"]) => void;
	conflictError: string;
	setConflictError: (val: string) => void;
	timeSlots: string[];
	tables: TableType[];
	getAvailableTablesForTime: (date: string, time: string) => TableType[];
	onCreate: () => void;
}

export const NewReservationModal = ({
	isOpen,
	onClose,
	newReservationForm,
	setNewReservationForm,
	conflictError,
	setConflictError,
	timeSlots,
	tables,
	getAvailableTablesForTime,
	onCreate,
}: NewReservationModalProps) => {
	const availableTables = getAvailableTablesForTime(
		newReservationForm.date,
		newReservationForm.time,
	);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Новое бронирование</DialogTitle>
				</DialogHeader>
				<div className='space-y-4'>
					{conflictError && <p style={{ color: "red" }}>{conflictError}</p>}

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<Label>Имя гостя *</Label>
							<Input
								value={newReservationForm.guestName}
								onChange={(e) =>
									setNewReservationForm({ ...newReservationForm, guestName: e.target.value })
								}
							/>
						</div>
						<div>
							<Label>Телефон *</Label>
							<Input
								value={newReservationForm.phone}
								onChange={(e) =>
									setNewReservationForm({ ...newReservationForm, phone: e.target.value })
								}
							/>
						</div>
					</div>

					<div className='grid grid-cols-4 gap-4'>
						<div>
							<Label>Гостей</Label>
							<Select
								value={newReservationForm.partySize.toString()}
								onValueChange={(value) => {
									setNewReservationForm({
										...newReservationForm,
										partySize: parseInt(value),
										tableId: "",
									});
									setConflictError("");
								}}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
										<SelectItem key={num} value={num.toString()}>
											{num}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label>Дата *</Label>
							<Input
								type='date'
								value={newReservationForm.date}
								onChange={(e) => {
									setNewReservationForm({
										...newReservationForm,
										date: e.target.value,
										tableId: "",
									});
									setConflictError("");
								}}
								min={new Date().toISOString().split("T")[0]}
							/>
						</div>

						<div>
							<Label>Время *</Label>
							<Select
								value={newReservationForm.time}
								onValueChange={(value) => {
									setNewReservationForm({ ...newReservationForm, time: value, tableId: "" });
									setConflictError("");
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder='Время' />
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

						<div>
							<Label>Стол *</Label>
							<Select
								value={newReservationForm.tableId}
								onValueChange={(value) => {
									setNewReservationForm({ ...newReservationForm, tableId: value });
									setConflictError("");
								}}
								disabled={!newReservationForm.date || !newReservationForm.time}
							>
								<SelectTrigger>
									<SelectValue placeholder='Выберите стол' />
								</SelectTrigger>
								<SelectContent>
									{availableTables.map((table) => (
										<SelectItem key={table.id} value={table.id}>
											Стол #{table.number} ({table.seats} мест)
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{newReservationForm.date && newReservationForm.time && availableTables.length === 0 && (
						<Alert>
							<AlertTriangle className='h-4 w-4' />
							<AlertDescription>
								На выбранное время нет доступных столов для {newReservationForm.partySize} человек
							</AlertDescription>
						</Alert>
					)}

					<div>
						<Label>Особые пожелания</Label>
						<Textarea
							value={newReservationForm.specialRequests}
							onChange={(e) =>
								setNewReservationForm({ ...newReservationForm, specialRequests: e.target.value })
							}
							placeholder='Столик у окна, детский стульчик и т.д.'
							rows={3}
						/>
					</div>

					<div className='flex gap-2 pt-4'>
						<Button
							variant='outline'
							onClick={() => {
								onClose();
								setConflictError("");
							}}
							className='flex-1'
						>
							Отмена
						</Button>
						<Button onClick={onCreate} className='flex-1'>
							Создать бронирование
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
