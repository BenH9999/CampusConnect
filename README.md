# Campus Connect

A social media platform for university students to connect, share posts, and interact with each other.

## Features

- User authentication (register, login)
- User profiles
- News feed
- Create posts
- Like and comment on posts
- Follow other users
- Real-time notifications
- Search for users

## Tech Stack

- **Frontend:** React Native, Expo
- **Backend:** Go
- **Database:** PostgreSQL
- **Containerization:** Docker, Docker Compose

## Running with Docker

The easiest way to get the application running is to use Docker Compose, which will set up both the backend API and PostgreSQL database.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (for running the frontend)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (for running the React Native app)

### Setup and Run

1. **Clone the repository:**

```bash
git clone https://github.com/BenH9999/CampusConnect.git
cd CampusConnect
```

2. **Configure environment variables (optional):**

The default configuration should work out of the box, but you can customize it by editing the `.env` file.

3. **Start the backend and database:**

```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL database container
- Build and start the Go backend API
- Initialize the database with required tables and sample data

4. **Run the frontend:**

```bash
npm install
npx expo start
```

5. **Access the application:**

- Backend API: [http://localhost:8080](http://localhost:8080)
- Connect with the Expo app by scanning the QR code or running in a simulator

### Stopping the Services

```bash
docker-compose down
```

To remove all data (including the database volume):

```bash
docker-compose down -v
```

## Troubleshooting

### Backend Connection Issues

If the frontend cannot connect to the backend:

1. Make sure the backend container is running:
```bash
docker-compose ps
```

2. Check backend logs for errors:
```bash
docker-compose logs backend
```

3. Update the `BASE_URL` in the frontend code to match your machine's IP address:
   - For iOS simulators: use `localhost` or `127.0.0.1`
   - For Android emulators: use `10.0.2.2` (special redirect to host machine)
   - For physical devices: use your computer's actual IP address on the network

### Database Connectivity Issues

If the backend cannot connect to the database:

1. Check database container status:
```bash
docker-compose ps
```

2. View database logs:
```bash
docker-compose logs postgres
```

## Development

For making changes to the application:

1. The frontend code is in the root directory under `app/` and `components/`.
2. The backend code is in the `backend/` directory.
3. After making changes to the backend, rebuild the Docker container:
```bash
docker-compose build backend
docker-compose up -d
``` 