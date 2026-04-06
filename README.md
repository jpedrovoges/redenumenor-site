# Numenor React Ecommerce

This project is an ecommerce application with a Django backend API and a Next.js frontend.

## Project Structure

```
numenor-react/
├── backend/     # Django API
└── frontend/    # Next.js application
```

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 22+
- Django installed
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the Django development server:
   ```bash
   python manage.py runserver
   ```

The backend API will be available at `http://localhost:8000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Run the Next.js development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`.

## Development

Both servers are currently running in the background. You can access the application through the frontend at `http://localhost:3000`.

## Building for Production

### Backend
```bash
cd backend
python manage.py collectstatic
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## Contributing

Please ensure that both backend and frontend are properly tested before committing changes.