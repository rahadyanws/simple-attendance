# [SIMPLE ATTENDANCE]

[A brief description of your project. Explain the purpose and main features of the project.]

## Key Features

* Login
* Logout
* Edit Profile
* Add Attendance
* List and Filter Attendance


## Prerequisites

Before running this project, make sure you have installed:

* [Node.js](https://nodejs.org/) (version >= [required Node.js version])
* [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/) (optional)
* [Database] (if your project uses a database)

## Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/rahadyanws/simple-attendance.git 
    
    cd simple-attendance
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Configure environment variables:

    Create a `.env` file in the project's root directory and add the necessary environment variables. Example:

    ```
    ACCESS_TOKEN_SECRET = ...
    REFRESH_TOKEN_SECRET = ...
    ```

4.  Run the server:

    ```bash
    npm start
    # or
    npm run dev
    ```

    The server will run at `http://localhost:[PORT]` (or the port you configured).

## Available Scripts

* `npm start`: Runs the server in production mode.
* `npm run dev`: Runs the server in development mode with automatic restart (using `nodemon`).
* `npm test`: Runs tests.
* `npm run lint`: Runs linter to check code style.

## Directory Structure
```
[simple-attendance]/
├── __test__/
├── node_modules/
├── src/
│   ├── configs/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── routers/
├── .env
├── gitignore
├── index.js
├── jest.configs.js
├── package.json
├── package-lock.json
├── README.md
└── gitignore
```

## Dependencies

* "bcrypt": "^5.1.1",
* "body-parser": "^1.20.3",
* "cors": "^2.8.5",
* "dotenv": "^16.4.7",
* "express": "^4.21.2",
* "jsonwebtoken": "^9.0.2",
* "moment-timezone": "^0.5.47",
* "mysql2": "^3.12.0",
* "uuid": "^11.1.0"

## Dev Dependencies
* "@babel/core": "^7.26.9",
* "@babel/preset-env": "^7.26.9",
* "babel-jest": "^29.7.0",
* "jest": "^29.7.0",
* "nodemon": "^3.1.9",
* "supertest": "^7.0.0"

## Contributing

If you'd like to contribute to this project, please follow these steps:

1.  Fork the repository.
2.  Create a new feature branch: `git checkout -b new-feature`.
3.  Make your changes and commit them: `git commit -m 'Add new feature'`.
4.  Push to the branch: `git push origin new-feature`.
5.  Create a Pull Request.

## License

This project is licensed under [Your License] - see the [LICENSE](LICENSE) file for details.

## Contact

* rahadyanws@gmail.com
* https://github.com/rahadyanws

## Acknowledgments

* [Acknowledgments to others who contributed or resources used]

---