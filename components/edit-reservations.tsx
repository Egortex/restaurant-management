import { Reservation, Table } from "@/app/page";
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
import React from "react";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	editForm: Partial<Reservation>;
	setEditForm: (value: Partial<Reservation>) => void;
	conflictError: string;
	setConflictError: (val: string) => void;
	timeSlots: string[];
	selectedReservation: Reservation | null;
	tables: Table[];
	getAvailableTablesForTime: (date: string, time: string, excludeReservationId?: string) => Table[];
	onSave: () => void;
}

const EditReservations: React.FC<Props> = ({
	isOpen,
	onClose,
	editForm,
	setEditForm,
	conflictError,
	setConflictError,
	timeSlots,
	selectedReservation,
	tables,
	getAvailableTablesForTime,
	onSave,
}) => {
	return (
		<>
			{/* Модальное окно редактирования */}
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Редактировать бронирование</DialogTitle>
					</DialogHeader>
					<div className='space-y-7'>
						{conflictError && <p style={{ color: "red" }}>{conflictError}</p>}

						{/* Имя и телефон */}
						<div className='flex grid-cols-2 gap-4'>
							<div>
								<Label>Имя гостя</Label>
								<Input
									value={editForm.guestName || ""}
									onChange={(e) => setEditForm({ ...editForm, guestName: e.target.value })}
								/>
							</div>
							<div>
								<Label>Телефон</Label>
								<Input
									value={editForm.phone || ""}
									onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
								/>
							</div>
						</div>

						{/* Стол, Кол-во гостей, Дата, Время */}
						<div className='flex'>
							<div>
								<Label>Стол</Label>
								<Select
									value={editForm.tableId || ""}
									onValueChange={(value) => {
										setEditForm({ ...editForm, tableId: value });
										setConflictError("");
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder='Выберите стол' />
									</SelectTrigger>
									<SelectContent>
										{getAvailableTablesForTime(
											editForm.date || "",
											editForm.time || "",
											selectedReservation?.id,
										).map((table) => (
											<SelectItem key={table.id} value={table.id}>
												Стол #{table.number} ({table.seats} мест)
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label>Количество гостей</Label>
								<Select
									value={editForm.partySize?.toString() || ""}
									onValueChange={(value) =>
										setEditForm({ ...editForm, partySize: parseInt(value) })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder='Выберите' />
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
								<Label>Дата</Label>
								<Input
									type='date'
									value={editForm.date || ""}
									onChange={(e) => {
										setEditForm({ ...editForm, date: e.target.value });
										setConflictError("");
									}}
								/>
							</div>

							<div>
								<Label>Время</Label>
								<Select
									value={editForm.time || ""}
									onValueChange={(value) => {
										setEditForm({ ...editForm, time: value });
										setConflictError("");
									}}
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

						{/* Особые пожелания */}
						<div>
							<Label>Особые пожелания</Label>
							<Textarea
								value={editForm.specialRequests || ""}
								onChange={(e) => setEditForm({ ...editForm, specialRequests: e.target.value })}
								rows={3}
							/>
						</div>

						{/* Кнопки */}
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
							<Button onClick={onSave} className='flex-1'>
								Сохранить
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default EditReservations;
