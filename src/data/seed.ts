import { AppDataSource } from './data-source';
import { Restaurant } from '../entities/Restaurant';
import { Table } from '../entities/Table';

AppDataSource.initialize().then(async () => {
    const restaurant1 = new Restaurant();
    restaurant1.name = "Lardo";
    restaurant1.endorsements = ["Gluten Free Options"];
    await AppDataSource.manager.save(restaurant1);

    const restaurant2 = new Restaurant();
    restaurant2.name = "Panadería Rosetta";
    restaurant2.endorsements = ["Vegetarian-Friendly", "Gluten Free Options"];
    await AppDataSource.manager.save(restaurant2);

    const restaurant3 = new Restaurant();
    restaurant3.name = "Tetetlán";
    restaurant3.endorsements = ["Paleo-friendly", "Gluten Free Options"];
    await AppDataSource.manager.save(restaurant3);

    const restaurant4 = new Restaurant();
    restaurant4.name = "Falling Piano Brewing Co";
    restaurant4.endorsements = [];
    await AppDataSource.manager.save(restaurant4);

    const restaurant5 = new Restaurant();
    restaurant5.name = "u.to.pi.a";
    restaurant5.endorsements = ["Vegan-Friendly", "Vegetarian-Friendly"];
    await AppDataSource.manager.save(restaurant5);

    const tables = [
        { capacity: 2, restaurant: restaurant1 },
        { capacity: 2, restaurant: restaurant1 },
        { capacity: 2, restaurant: restaurant1 },
        { capacity: 2, restaurant: restaurant1 },
        { capacity: 4, restaurant: restaurant1 },
        { capacity: 4, restaurant: restaurant1 },
        { capacity: 6, restaurant: restaurant1 },
        { capacity: 2, restaurant: restaurant2 },
        { capacity: 2, restaurant: restaurant2 },
        { capacity: 2, restaurant: restaurant2 },
        { capacity: 4, restaurant: restaurant2 },
        { capacity: 4, restaurant: restaurant2 },
        { capacity: 2, restaurant: restaurant3 },
        { capacity: 2, restaurant: restaurant3 },
        { capacity: 2, restaurant: restaurant3 },
        { capacity: 2, restaurant: restaurant3 },
        { capacity: 4, restaurant: restaurant3 },
        { capacity: 4, restaurant: restaurant3 },
        { capacity: 6, restaurant: restaurant3 },
        { capacity: 2, restaurant: restaurant4 },
        { capacity: 2, restaurant: restaurant4 },
        { capacity: 2, restaurant: restaurant4 },
        { capacity: 2, restaurant: restaurant4 },
        { capacity: 2, restaurant: restaurant4 },
        { capacity: 4, restaurant: restaurant4 },
        { capacity: 4, restaurant: restaurant4 },
        { capacity: 4, restaurant: restaurant4 },
        { capacity: 4, restaurant: restaurant4 },
        { capacity: 4, restaurant: restaurant4 },
        { capacity: 6, restaurant: restaurant4 },
        { capacity: 6, restaurant: restaurant4 },
        { capacity: 6, restaurant: restaurant4 },
        { capacity: 6, restaurant: restaurant4 },
        { capacity: 6, restaurant: restaurant4 },
        { capacity: 2, restaurant: restaurant5 },
        { capacity: 2, restaurant: restaurant5 }
    ];

    for (const tableData of tables) {
        const table = new Table();
        table.capacity = tableData.capacity;
        table.restaurant = tableData.restaurant;
        await AppDataSource.manager.save(table);
    }

    console.log('Database seeded!');
    await AppDataSource.destroy();
}).catch(error => console.log(error));
