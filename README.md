# Doctor-app
## Installation

Setup is super easy. - 

```shell script
npm install
```

Create an ``.env`` file at the root of your project with the following.  


```dotenv
MONGO_URL=YOUR_MONGO_URL
PORT=5000[YOUR_DESIRED_PORT]
NODE_ENV=YOUR_APP_ENVIRONMENT[production/development]
JWT_SECRET=YOUR_JWT_SECRET_STRING
```

An example file `.env.example` is included.

Your project is ready. Now start the project.

```shell script
npm start
```

Go to ``http://localhost:5000``. You should see a default welcome page.

Your API base path is ``http://localhost:5000/api``.

First create some accounts to get started with the authentication.

## Authentication

JWT authentication is added in this project. User model is defined in models/User.js. 
For Register, Login, Logout use these urls —
```
    [POST] api/auth/register
    [POST] api/auth/login
    [GET] api/auth/logout
```

## Features

1. **Controller, Model & Service oriented architecture**

1. **Auth with JWT & Db Store**

1. **Async/Await support**

1. **User Module**

1. **Patients Module** (Sample CRUD)

1. **Files Upload**

1. **Centralized Http Response**

1. **Error Handler**

1. **.env support**

1. **Multi Environment config setup**

1. **Built in Pagination**

## Directory Structure of the Project
```
├─ .env
├─ .gitignore
├─ config
│  ├─ config.js
│  ├─ database.js
│  ├─ routes.js
│  └─ server.js
├─ index.js
├─ package.json
├─ system
└─ src
  ├─ controllers
  │  ├─ AuthController.js
  │  ├─ FilesController.js
  │  └─ PatientsController.js
  ├─ helpers
  ├─ models
  │  ├─ Auth.js
  │  ├─ Files.js
  │  ├─ Patients.js
  │  └─ User.js
  ├─ routes
  │  ├─ auth.js
  │  ├─ Files.js
  │  └─ patients.js
  └─ services
     ├─ AuthService.js
     ├─ FilesService.js
     ├─ PatientsService.js
     └─ UserService.js
```
