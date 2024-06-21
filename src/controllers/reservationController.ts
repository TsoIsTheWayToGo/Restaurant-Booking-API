import { Request, Response } from 'express';
import { AppDataSource } from '../data/data-source';
import { Reservation } from '../entities/Reservation';
import { Table } from '../entities/Table';

export const createReservation = async (req: Request, res: Response) => {
    const { dinerName, reservationTime, tableId } = req.body;

    if (!dinerName || !reservationTime || !tableId) {
        return res.status(400).json({ message: 'Invalid data' });
    }

    try {
        const tableRepository = AppDataSource.getRepository(Table);
        const reservationRepository = AppDataSource.getRepository(Reservation);

        const table = await tableRepository.findOne({ where: { id: tableId } });

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        const reservationTimeStart = new Date(reservationTime);

        const isReserved = await Reservation.checkExistingReservation(tableId, reservationTimeStart, reservationRepository);
        if (isReserved) {
            return res.status(400).json({ message: 'Table is already reserved at this time' });
        }

        const hasOverlap = await Reservation.checkOverlappingReservation(dinerName, reservationTimeStart, reservationRepository);
        if (hasOverlap) {
            return res.status(400).json({ message: 'User has overlapping reservations' });
        }

        const reservation = await Reservation.createNewReservation(dinerName, reservationTimeStart, table, reservationRepository);

        res.status(201).json(reservation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteReservation = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
        return res.status(404).json({ message: 'Reservation not found' });
    }

    try {
        const reservation = await AppDataSource.getRepository(Reservation).findOne({ where: { id: parseInt(id) } });
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        await AppDataSource.getRepository(Reservation).remove(reservation);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
