import request from 'supertest';
import app from '../index';
import { AppDataSource } from '../data/data-source';
import { Reservation } from '../entities/Reservation';
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

describe('Search Restaurants API', () => {
    beforeEach(async () => {
        await AppDataSource.getRepository(Reservation).clear();
    });

    it('should return 400 if no time is specified', async () => {
        const response = await request(app)
            .post('/restaurants/search')
            .send({
                eaters: [
                    { name: 'Alice', dietaryRestrictions: ['Vegan-Friendly'] },
                    { name: 'Bob', dietaryRestrictions: ['Gluten Free Options'] }
                ]
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Please specify a time');
    });

    it('should return 400 when no eaters are provided', async () => {
        const response = await request(app)
            .post('/restaurants/search')
            .send({
                time: '2024-06-19T12:00:00.000Z'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Eaters are required');
    });

    it('should find restaurants with all dietary endorsements and available tables', async () => {
        const response = await request(app)
            .post('/restaurants/search')
            .send({
                eaters: [
                    { name: 'Bob', dietaryRestrictions: ['Gluten Free Options'] },
                    { name: 'Eric', dietaryRestrictions: ['Paleo-friendly'] }
                ],
                time: '2024-06-19T12:00:00.000Z'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].name).toBe('Tetetlán');
    });

    it('should return empty array when no restaurants meet all dietary endorsements', async () => {
        const response = await request(app)
            .post('/restaurants/search')
            .send({
                eaters: [
                    { name: 'Alice', dietaryRestrictions: ['Keto-friendly'] },
                    { name: 'Bob', dietaryRestrictions: ['Gluten Free Options'] }
                ],
                time: '2024-06-19T12:00:00.000Z'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(0);
    });

    it('should return all restaurants with available tables if no dietary restrictions', async () => {
        const response = await request(app)
            .post('/restaurants/search')
            .send({
                eaters: [
                    { name: 'Charlie', dietaryRestrictions: [] }
                ],
                time: '2024-06-19T12:00:00.000Z'
            });

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it('should require a specific time', async () => {
        const response = await request(app)
            .post('/restaurants/search')
            .send({
                eaters: [
                    { name: 'Bob', dietaryRestrictions: ['Gluten Free Options'] },
                    { name: 'Eric', dietaryRestrictions: ['Paleo-friendly'] }
                ],
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Please specify a time');
    });

    it('should return empty array if no available tables at the specified time', async () => {
        const table = await AppDataSource.getRepository(Table).findOne({ where: { capacity: 2 } });
        if (table) {
            // Create a reservation to make the table unavailable
            const reservation = new Reservation();
            reservation.dinerName = 'Jane Doe';
            reservation.reservationTime = new Date('2024-06-19T12:00:00.000Z');
            reservation.table = table;
            await AppDataSource.getRepository(Reservation).save(reservation);
        }

        const response = await request(app)
            .post('/restaurants/search')
            .send({
                eaters: [
                    { name: 'Alice', dietaryRestrictions: ['Vegan-Friendly'] },
                    { name: 'Bob', dietaryRestrictions: ['Gluten Free Options'] }
                ],
                time: '2024-06-19T12:00:00.000Z'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(0);
    });
});
