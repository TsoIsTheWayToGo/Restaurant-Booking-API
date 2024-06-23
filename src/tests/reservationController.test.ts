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

    it('should not create a reservation if the table is already reserved', async () => {
        const table = await AppDataSource.getRepository(Table).findOne({ where: { capacity: 2 } });

        if (!table) {
            throw new Error('Test setup failed: No table found');
        }

        const reservationTime = '2024-01-01T12:00:00Z';

        // Create the first reservation
        const firstReservationResponse = await request(app)
            .post('/reservations')
            .send({
                dinerName: 'John Doe',
                reservationTime: reservationTime,
                tableId: table.id,
            });

        expect(firstReservationResponse.status).toBe(201);

        // make sure reservation is actually saved before making another reservation
        const createdReservation = await AppDataSource.getRepository(Reservation).findOne({
            where: { table: { id: table.id }, reservationTime: new Date(reservationTime) }
        });

        if(createdReservation){
        // create a second reservation at the same time for the same table
        const secondReservationResponse = await request(app)
            .post('/reservations')
            .send({
                dinerName: 'Jane Doe',
                reservationTime: reservationTime,
                tableId: table.id,
            });

        expect(secondReservationResponse.status).toBe(400);
        expect(secondReservationResponse.body.message).toBe('Table is already reserved at this time');
        }
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

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Your reservation has been cancelled');

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

describe('Group Reservation API', () => {
    beforeEach(async () => {
        await AppDataSource.getRepository(Reservation).clear();
    });

    it('should create a group reservation successfully', async () => {
        const table = await AppDataSource.getRepository(Table).findOne({ where: { capacity: 6 } });

        if (!table) {
            throw new Error('Test setup failed: No table found');
        }

        const reservationTime = '2024-06-19T12:00:00.000Z';

        const response = await request(app)
            .post('/reservations/group')
            .send({
                groupName: 'Birthday Party',
                reservationTime,
                tableId: table.id,
                diners: ['Alice', 'Bob']
            });

        expect(response.status).toBe(201);
        expect(response.body.reservationId).toBeDefined();
        expect(response.body.groupId).toBe('Birthday Party');
        expect(response.body.diners).toHaveLength(2);
        expect(response.body.diners).toContain('Alice');
        expect(response.body.diners).toContain('Bob');
    });

    it('should not create a group reservation if the table is already reserved', async () => {
        const table = await AppDataSource.getRepository(Table).findOne({ where: { capacity: 6 } });

        if (!table) {
            throw new Error('Test setup failed: No table found');
        }

        const reservationTime = '2024-06-19T12:00:00.000Z';

        // Create the first reservation
        await request(app)
            .post('/reservations/group')
            .send({
                groupName: 'First Group',
                reservationTime,
                tableId: table.id,
                diners: ['Alice', 'Bob']
            });

        // Attempt to create a second reservation at the same time for the same table
        const response = await request(app)
            .post('/reservations/group')
            .send({
                groupName: 'Second Group',
                reservationTime,
                tableId: table.id,
                diners: ['Charlie', 'Dave']
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Table is already reserved at this time');
    });

    it('should not create a group reservation if there are overlapping reservations for a diner', async () => {
        const table = await AppDataSource.getRepository(Table).findOne({ where: { capacity: 6 } });

        if (!table) {
            throw new Error('Test setup failed: No table found');
        }

        const reservationTime = '2024-06-19T12:00:00.000Z';

        // Create the first reservation
        await request(app)
            .post('/reservations')
            .send({
                dinerName: 'Alice',
                reservationTime,
                tableId: table.id,
            });

        // Attempt to create a group reservation with Alice who already has a reservation
        const response = await request(app)
            .post('/reservations/group')
            .send({
                groupName: 'Friends Gathering',
                reservationTime,
                tableId: table.id,
                diners: ['Alice', 'Bob']
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User Alice has overlapping reservations');
    });
});
