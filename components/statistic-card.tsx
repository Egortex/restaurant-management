import { Card, CardContent } from "@/components/ui/card";

import { Users } from "lucide-react";
import React from "react";
import { Badge } from "./ui/badge";

interface Props {
	stats: {
		available: number;
		occupied: number;
		reserved: number;
		cleaning: number;
		total: number;
	};
}

const StatisticCard: React.FC<Props> = ({ stats }) => {
	return (
		<>
			{/* Статистика */}

			<div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-6'>
				<Card>
					<CardContent className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-gray-600'>Всего столов</p>
								<p className='text-2xl font-bold'>{stats.total}</p>
							</div>
							<Users className='h-8 w-8 text-gray-400' />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-gray-600'>Доступно</p>
								<p className='text-2xl font-bold text-green-600'>{stats.available}</p>
							</div>
							<Badge variant='secondary' className='bg-green-100 text-green-800'>
								Свободно
							</Badge>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-gray-600'>Занято</p>
								<p className='text-2xl font-bold text-red-600'>{stats.occupied}</p>
							</div>
							<Badge variant='secondary' className='bg-red-100 text-red-800'>
								Занято
							</Badge>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-gray-600'>Забронировано</p>
								<p className='text-2xl font-bold text-blue-600'>{stats.reserved}</p>
							</div>
							<Badge variant='secondary' className='bg-blue-100 text-blue-800'>
								Бронь
							</Badge>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-gray-600'>Уборка</p>
								<p className='text-2xl font-bold text-yellow-600'>{stats.cleaning}</p>
							</div>
							<Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>
								Уборка
							</Badge>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
};

export default StatisticCard;
