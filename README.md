# ALL Menuiserie — Gestion de Pointage

<p align="center">
  <img src="all.png" alt="ALL Menuiserie" width="160">
</p>

A desktop app for a joinery workshop (menuiserie) to track employee hours, projects, salaries, advances, and finances. It runs fully offline: a Spring Boot backend and a React frontend packaged together with Electron, plus a bundled Java runtime. Users don't need Java or a database installed.

## Features

- **Pointage / Planning**: log employee hours by job (*affaire*), workshop (*atelier*) or site (*chantier*)
- **Personnels**: manage employees, roles and hourly rates
- **Projets**: track projects and the hours spent on them
- **Salaire**: monthly salary calculation from logged hours
- **Finance**: advances (*acomptes*) and financial status (*situation financière*)
- **Synthèse & Dashboard**: overviews and summaries
- **Management**: user accounts with admin and standard roles

## Tech stack

| Layer    | Technology                                                    |
| -------- | ------------------------------------------------------------- |
| Frontend | React 18, React Router, Vite                                  |
| Backend  | Java 17, Spring Boot 3.5, Spring Data JPA, Lombok             |
| Database | MySQL (development) / embedded H2 file database (desktop app) |
| Desktop  | Electron 31, electron-builder, bundled Temurin JRE 17         |

## Project structure

```
pointage-app/
├── backend/        Spring Boot REST API (port 8080)
├── frontend/       React + Vite UI (dev server on port 3000)
├── electron/       Electron shell that starts the backend and loads the UI
├── database/       MySQL schema (schema.sql)
├── build-mac.sh    Builds the macOS .dmg installer
└── build-win.sh    Builds the Windows .exe
```

## Running in development

**Requirements:** Java 17, Maven, Node.js 18+, MySQL 8

1. **Create the database**
   ```bash
   mysql -u root -p < database/schema.sql
   ```

2. **Start the backend.** Credentials come from environment variables, not the code:
   ```bash
   cd backend
   DB_USERNAME=root DB_PASSWORD=your_mysql_password ADMIN_PASSWORD=choose_one mvn spring-boot:run
   ```

   | Variable         | Purpose                                   | Default |
   | ---------------- | ----------------------------------------- | ------- |
   | `DB_USERNAME`    | MySQL user                                | `root`  |
   | `DB_PASSWORD`    | MySQL password                            | *(empty)* |
   | `ADMIN_PASSWORD` | Password for the first `admin` account    | `admin` |

3. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open http://localhost:3000. The dev server forwards `/api` calls to the backend on port 8080.

On first start the backend creates an `admin` account if none exists, using `ADMIN_PASSWORD`. Change the password after you log in.

## Building the installers

The build scripts download a JRE (once), build the backend JAR and the frontend, then package everything with Electron. The output goes to `electron/dist-electron/`.

```bash
./build-mac.sh   # macOS Apple Silicon .dmg
./build-win.sh   # Windows x64 .exe (on macOS, needs: brew install --cask wine-stable)
```

The packaged app uses an embedded H2 database stored in the user's app-data folder, so no MySQL server is needed.

> **Note:** The installers are unsigned.
> - **macOS:** right-click the app → *Open* → *Open*, or go to *System Settings → Privacy & Security → Open Anyway*.
> - **Windows:** on the SmartScreen warning, click *More info* → *Run anyway*.
