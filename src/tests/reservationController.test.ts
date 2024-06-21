import request from 'supertest';
import app from '../index';
import { AppDataSource } from '../data/data-source';
import { Reservation } from '../entities/Reservation';
import { Restaurant } from '../entities/Restaurant';
import { Table } from '../entities/Table';

beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
});

afterAll(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
});

describe('Reservation API', () => {
    beforeEach(async () => {
        await AppDataSource.getRepository(Reservation).clear();
    });

    it('should create a reservation successfully', async () => {
        const table = await AppDataSource.getRepository(Table).findOne({ where: { capacity: 2 } });

        if (!table) {
            throw new Error('Test setup failed: No table found');
        }

        const response = await request(app)
            .post('/reservations')
            .send({
                dinerName: 'John Doe',
                reservationTime: new Date(),
                tableId: table.id,
            });

        expect(response.status).toBe(201);
        expect(response.body.dinerName).toBe('John Doe');
    });

    it('should not create a reservation for a non-existent table', async () => {
        const response = await request(app)
            .post('/reservations')
            .send({
                dinerName: 'John Doe',
                reservationTime: new Date(),
                tableId: 999,
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Table not found');
    });

    it('should not create a reservation with invalid data', async () => {
        const table = await AppDataSource.getRepository(Table).findOne({ where: { capacity: 2 } });

        if (!table) {
            throw new Error('Test setup failed: No table found');
        }

        const response = await request(app)
            .post('/reservations')
            .send({
                dinerName: '',
                reservationTime: new Date(),
                tableId: table.id,
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid data');
    });
});

describe('DELETE /reservations/:id', () => {
    let reservation: Reservation;

    beforeEach(async () => {
        // Find an existing table
        const table = await AppDataSource.getRepository(Table).findOne({ where: { capacity: 2 } });
        if (!table) {
            throw new Error('Test setup failed: No table found');
        }

        // Create a reservation
        reservation = new Reservation();
        reservation.dinerName = 'John Doe';
        reservation.reservationTime = new Date();
        reservation.table = table;
        await AppDataSource.getRepository(Reservation).save(reservation);
    });

    it('should delete a reservation successfully', async () => {
        const response = await request(app)
            .delete(`/reservations/${reservation.id}`);

        expect(response.status).toBe(204);

        const deletedReservation = await AppDataSource.getRepository(Reservation).findOne({ where: { id: reservation.id } });
        expect(deletedReservation).toBeNull();
    });

    it('should return 404 if reservation does not exist', async () => {
        const nonExistentId = reservation.id + 9999;
        const response = await request(app)
            .delete(`/reservations/${nonExistentId}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Reservation not found');
    });

    it('should return 404 for invalid reservation ID', async () => {
        const response = await request(app)
            .delete('/reservations/invalid-id');

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Reservation not found');
    });
});