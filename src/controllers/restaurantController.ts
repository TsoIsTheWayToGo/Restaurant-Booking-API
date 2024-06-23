import { Request, Response } from 'express';
import { AppDataSource } from '../data/data-source';
import { Restaurant } from '../entities/Restaurant';

export const findRestaurants = async (req: Request, res: Response) => {
    const { eaters, time } = req.body;

    if (!time) {
        return res.status(400).json({ message: 'Please specify a time' });
    }

    if (!eaters || eaters.length === 0) {
        return res.status(400).json({ message: 'Eaters are required' });
    }

    const endorsements = eaters.flatMap((eater: any) => eater.dietaryRestrictions);

    try {
        const restaurants = await AppDataSource.getRepository(Restaurant)
            .createQueryBuilder('restaurant')
            .leftJoinAndSelect('restaurant.tables', 'table')
            .leftJoinAndSelect('table.reservations', 'reservation')
            .where(`ARRAY(SELECT UNNEST(restaurant.endorsements)) @> ARRAY[:...endorsements]::text[]`, { endorsements })
            .getMany();

        const filteredRestaurants = restaurants.map(restaurant => {
            const availableTables = restaurant.tables.filter(table =>
                !table.reservations.some(reservation =>
                    new Date(reservation.reservationTime).toISOString() === new Date(time).toISOString()
                )
            );

            return {
                id: restaurant.id,
                name: restaurant.name,
                endorsements: restaurant.endorsements,
                availableTables: availableTables.length
            };
        }).filter(restaurant => restaurant.availableTables > 0);

        res.json(filteredRestaurants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
