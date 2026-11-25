# AI-Powered Adaptive Personalized Learning Recommendation System

An AI-powered web-based learning platform developed as part of the Master of Computer Applications (MCA) academic project.

The system aims to provide students with a personalized learning experience through course management, assessments, learning progress tracking, and machine-learning-based recommendations.

## Project Overview

The platform consists of two main modules:

- **Student Module:** Allows students to register, access courses, explore learning resources, attempt assessments, track learning progress, and view personalized recommendations.
- **Administrator Module:** Allows administrators to manage courses, topics, learning resources, assessments, and student information.

The project also includes a Machine Learning module for student mastery prediction and personalized learning support.

## Technology Stack

### Frontend
- React.js
- Tailwind CSS
- JavaScript
- Axios
- React Router
- Lucide React

### Backend
- Python
- Django
- Django REST Framework

### Database
- PostgreSQL

### Machine Learning
- Python
- Scikit-learn
- Joblib

## Key Features

### Student Features
- Student registration and authentication
- Student dashboard
- Course browsing and course details
- Topic-based learning
- Learning resource access
- Video-based learning
- Online assessments
- Assessment attempts and results
- Learning path access
- Personalized recommendations
- Password recovery and reset

### Administrator Features
- Administrator authentication
- Admin dashboard
- Course management
- Topic management
- Learning resource management
- Assessment management
- Student management

### Machine Learning Features
- Dataset generation
- Model training
- Student mastery prediction
- Prediction service integration
- Saved trained model

## Project Structure

```text
ADAPTIVE LEARNING PLATFORM/
│
├── backend/
│   ├── accounts/
│   ├── assessments/
│   ├── config/
│   ├── courses/
│   ├── learning/
│   ├── ml_engine/
│   │   ├── generate_dataset.py
│   │   ├── predict.py
│   │   ├── service.py
│   │   ├── train_model.py
│   │   ├── test_prediction.py
│   │   └── student_mastery_model.joblib
│   └── recommendations/
│
├── frontend/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       └── services/
│
├── docs/
│   └── database_design.md
│
├── requirements.txt
├── .gitignore
└── README.md
```

## Installation and Setup

### Prerequisites

- Python 3
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Akashgeorge123/adaptive-personalized-learning-system.git

cd adaptive-personalized-learning-system
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the Python dependencies:

```powershell
pip install -r ..\requirements.txt
```

### 3. Database Configuration

Create a PostgreSQL database and configure the following environment variables in `backend/.env`:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True

DB_NAME=adaptive_learning
DB_USER=your-postgresql-username
DB_PASSWORD=your-postgresql-password
DB_HOST=localhost
DB_PORT=5432
DB_SSLMODE=disable
```

Ensure the database schema is configured according to `docs/database_design.md`.

Do not upload your `.env` file or database credentials to GitHub.

### 4. Run the Backend

From the `backend` directory:

```powershell
python manage.py check
python manage.py runserver
```

The backend will normally run at:

`http://127.0.0.1:8000/`

### 5. Frontend Setup

Open another terminal and navigate to the frontend directory:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the React development server:

```powershell
npm run dev
```

The frontend will normally run at:

`http://localhost:5173/`

## Machine Learning Module

The `backend/ml_engine/` directory contains the machine learning components:

| File | Purpose |
|---|---|
| `generate_dataset.py` | Generates the dataset |
| `train_model.py` | Trains the machine learning model |
| `predict.py` | Performs predictions |
| `service.py` | Provides prediction service integration |
| `test_prediction.py` | Tests prediction functionality |
| `student_mastery_model.joblib` | Saved trained model |

## Documentation

Database design documentation is available in:

`docs/database_design.md`

## Academic Information

**Programme:** Master of Computer Applications (MCA)

**Institution:** Indira Gandhi National Open University (IGNOU)

**Project Title:** AI-Powered Adaptive Personalized Learning Recommendation System Using Machine Learning

## Author

**Akash George**

---

*Developed as part of the MCA academic project.*