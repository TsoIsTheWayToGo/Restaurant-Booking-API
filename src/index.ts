import { AppDataSource } from './data/data-source';
import express from 'express';
import { findRestaurants } from './controllers/restaurantController';
import { createReservation, deleteReservation, createGroupReservation } from './controllers/reservationController';

const app = express();
app.use(express.json());

app.post('/restaurants/search', findRestaurants);

app.post('/reservations', createReservation);
app.post('/reservations/group', createGroupReservation);
app.delete('/reservations/:id', deleteReservation);


if (process.env.NODE_ENV !== 'test') {
    AppDataSource.initialize().then(() => {
        console.log('Data Source has been initialized!');
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    }).catch((error) => console.log(error));
}

export default app;
