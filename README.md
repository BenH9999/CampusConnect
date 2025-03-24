# Campus Connect

A social media platform for university students to connect, share posts, and interact with each other.

> **IMPORTANT:** This application is primarily optimized for iOS devices, though compatible with Android as well.

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

## System Requirements

- At least 2GB of free RAM for Docker containers
- At least 1GB of free disk space
- Docker and Docker Compose
- Node.js and npm for running the frontend

## Running with Docker

The easiest way to get the application running is to use Docker Compose, which will set up both the backend API and PostgreSQL database.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (for running the frontend)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (for running the React Native app)

### OS-Specific Setup

#### Windows

1. **Docker Setup**:
   - Install [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
   - Ensure WSL 2 is enabled (recommended during installation)
   - Start Docker Desktop before proceeding

2. **IP Address Configuration**:
   - Find your local IP address by running `ipconfig` in Command Prompt
   - Update the `BASE_URL` in `constants/api.ts` to use your IP address

3. **Special Emulator Considerations**:
   - For Android emulators, you may need to use `10.0.2.2` instead of `localhost`
   - For iOS simulators, `localhost` or `127.0.0.1` should work

#### macOS

1. **Docker Setup**:
   - Install [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
   - Ensure Docker has sufficient resources allocated (Settings → Resources)

2. **IP Address Configuration**:
   - Find your local IP address in System Preferences → Network
   - Update the `BASE_URL` in `constants/api.ts` to use your IP address

3. **Special Simulator Considerations**:
   - For iOS simulators, `localhost` or `127.0.0.1` should work without changes

#### Linux

1. **Docker Setup**:
   - Install Docker and Docker Compose:
     ```bash
     # For Ubuntu/Debian
     sudo apt update
     sudo apt install docker.io docker-compose
     
     # For Arch Linux
     sudo pacman -S docker docker-compose
     
     # For Fedora
     sudo dnf install docker docker-compose
     ```
   - Start and enable Docker service:
     ```bash
     sudo systemctl start docker
     sudo systemctl enable docker
     ```
   - Add your user to the docker group to run Docker without sudo:
     ```bash
     sudo usermod -aG docker $USER
     ```
     Then log out and log back in

2. **IP Address Configuration**:
   - Find your local IP address by running `ip addr show` or `hostname -I`
   - Update the `BASE_URL` in `constants/api.ts` to use your IP address

### Setup and Run

1. **Clone the repository:**

```bash
git clone https://github.com/BenH9999/CampusConnect.git
cd CampusConnect
```

2. **Start the backend and database:**

```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL database container
- Build and start the Go backend API
- Initialize the database with required tables and sample data

3. **Verify services are running properly:**

```bash
docker-compose ps
```

You should see both services with the `Up` status.

4. **Run the frontend:**

```bash
npm install
npx expo start
```

5. **Connect to the app:**

- **Physical device via QR code:**
  - Scan the QR code with the Expo Go app ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent)/[iOS](https://apps.apple.com/app/expo-go/id982107779))
  - Make sure your phone is on the same WiFi network as your computer

- **iOS Simulator:**
  - Press `i` in the terminal or click "Run on iOS simulator" in the Expo browser window
  - Requires Xcode installed (macOS only)

- **Android Emulator:**
  - Press `a` in the terminal or click "Run on Android device/emulator" 
  - Requires Android Studio and an emulator set up

6. **Access the backend API directly:**

- Backend API: [http://localhost:8080](http://localhost:8080)

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

3. Update the `BASE_URL` in `constants/api.ts` to match your machine's IP address:
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

3. If database appears to be up but backend can't connect, try restarting the backend:
```bash
docker-compose restart backend
```

### Sample Data Issues

If sample data doesn't appear to be loaded:

1. Check backend logs for any initialization errors:
```bash
docker-compose logs backend
```

2. You can manually reinitialize the database by:
```bash
# Stop all containers
docker-compose down

# Remove volumes to clear database
docker-compose down -v

# Start fresh
docker-compose up -d
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