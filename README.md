# Restaurant Booking API

This is a RESTful API for a restaurant booking system with a social twist. It allows users to search for restaurants that meet specific dietary restrictions and make reservations.

## Note to Interviewers

I built this API to meet the challenge requirements, but in a real-world scenario, I would make several improvements to enhance performance, scalability, and maintainability. I would add thorough data validation, implement global error handling, and use unique identifiers like email addresses or phone numbers. To handle multiple reservations simultaneously, I would use database transactions and optimize the database with indexes. Additionally, I would implement strong security measures, including authentication and authorization. These changes would make the API more reliable and maintainable in a production environment.


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

You can find the Postman collection [here](https://www.postman.com/research-explorer-79332691/workspace/resturant-booking-api/collection/36457999-02175f19-282b-443b-89f7-84d2cd9a8d40).
[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://god.gw.postman.com/run-collection/36457999-51adfbf1-9428-4bd4-8260-d1bed291f81d?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D36457999-51adfbf1-9428-4bd4-8260-d1bed291f81d%26entityType%3Dcollection%26workspaceId%3D191da073-c8b8-4aec-a446-3672a604c4ba)
### Find Restaurants

- **Endpoint**: `/restaurants/search`
- **Method**: `POST`
- **Request Body**:

    ```json
    {
        "eaters": [
            { "name": "Alice", "dietaryRestrictions": ["Paleo-friendly"] },
            { "name": "Bob", "dietaryRestrictions": ["Gluten Free Options"] }
        ],
        "time": "2024-06-19T13:00:00.000Z"
    }
    ```

- **Response**:

    ```json
    [
        {
            "id": 3,
            "name": "Tetetlán",
            "endorsements": [
                "Paleo-friendly",
                "Gluten Free Options"
            ],
            "availableTables": 7
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
        "table": {
            "id": 1,
            "capacity": 2,
            "restaurant": {
                "id": 1,
                "name": "Lardo"
            }
        }
    }
    ```

### Create Group Reservation

- **Endpoint**: `/reservations/group`
- **Method**: `POST`
- **Request Body**:

    ```json
    {
        "groupName": "Birthday Party",
        "reservationTime": "2024-06-19T12:00:00.000Z",
        "tableId": 1,
        "diners": ["Alice", "Bob"]
    }
    ```

- **Response**:

    ```json
    {
        "reservationId": 1,
        "reservationTime": "2024-06-19T12:00:00.000Z",
        "groupId": "Birthday Party",
        "diners": ["Alice", "Bob"],
        "table": {
            "id": 1,
            "capacity": 2,
            "restaurant": {
                "id": 1,
                "name": "Lardo"
            }
        }
    }
    ```

### Delete Reservation

- **Endpoint**: `/reservations/:id`
- **Method**: `DELETE`
- **Response**:

    ```json
    {
        "message": "Your reservation has been cancelled"
    }
    ```


## Testing

Run tests using Jest:

```bash
npm test
