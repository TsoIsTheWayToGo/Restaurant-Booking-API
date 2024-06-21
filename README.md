# Restaurant Booking API

This is a RESTful API for a restaurant booking system with a social twist. It allows users to search for restaurants that meet specific dietary restrictions and make reservations.

## Features

- **Find Restaurants**: Search for restaurants that meet specific dietary restrictions and have available tables at a given time.
- **Create Reservations**: Make a reservation at a restaurant for a specific time.
- **Delete Reservations**: Cancel an existing reservation.

## Technologies Used

- **Node.js**
- **Express.js**
- **TypeORM**
- **PostgreSQL**
- **TypeScript**
- **Jest**

## Prerequisites

- Node.js (>=14.x.x)
- PostgreSQL (>=13.x.x)


## Setup

1. **Clone the repository**:

    ```bash
    git clone https://github.com/TsoIsTheWayToGo/restaurant-booking-api.git
    cd restaurant-booking-api
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Set up the PostgreSQL database**:

    If you are using `psql` (PostgreSQL interactive terminal), run the following commands to create the database and grant privileges:

    ```sql
    CREATE DATABASE restaurant_booking;
    GRANT ALL PRIVILEGES ON DATABASE restaurant_booking TO restaurant_user;
    ```

4. **Create a `.env` file** in the root directory with the following content:

    ```env
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=restaurant_user
    DB_PASSWORD=password
    DB_NAME=restaurant_booking
    ```

5. **Seed the database**:

    ```bash
    npm run seed
    ```

6. **Run the server**:

    ```bash
    npm run dev
    ```

## API Endpoints
You can find the Postman collection for this API [here](https://www.postman.com/research-explorer-79332691/workspace/resturant-booking-api/collection/36457999-02175f19-282b-443b-89f7-84d2cd9a8d40).
### Find Restaurants

- **Endpoint**: `/restaurants/search`
- **Method**: `POST`
- **Request Body**:

    ```json
    {
        "eaters": [
            { "name": "Alice", "dietaryRestrictions": ["Vegan-Friendly"] },
            { "name": "Bob", "dietaryRestrictions": ["Gluten Free Options"] }
        ],
        "time": "2024-06-19T12:00:00.000Z"
    }
    ```

- **Response**:

    ```json
    [
        {
            "id": 3,
            "name": "Tetetlán",
            "endorsements": ["Paleo-friendly", "Gluten Free Options"],
            "tables": [
                { "id": 13, "capacity": 2, "reservations": [] },
                ...
            ]
        }
    ]
    ```

### Create Reservation

- **Endpoint**: `/reservations`
- **Method**: `POST`
- **Request Body**:

    ```json
    {
        "dinerName": "John Doe",
        "reservationTime": "2024-06-19T12:00:00.000Z",
        "tableId": 1
    }
    ```

- **Response**:

    ```json
    {
        "id": 1,
        "dinerName": "John Doe",
        "reservationTime": "2024-06-19T12:00:00.000Z",
        "table": { "id": 1, "capacity": 2, "restaurant": { "id": 1, "name": "Lardo" } }
    }
    ```

### Delete Reservation

- **Endpoint**: `/reservations/:id`
- **Method**: `DELETE`
- **Response**: `204 No Content` if successful

## Testing

Run tests using Jest:

```bash
npm test


