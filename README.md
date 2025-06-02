# Watering System UI

A web-based control interface for a garden watering system. Built with Angular and Java, this application provides a user-friendly interface to control and monitor your watering system.

## Features

- System status monitoring
- Manual/Auto mode switching
- Individual area control (8 zones)
- Real-time command feedback
- Responsive web interface

## Technical Stack

- Frontend: Angular 16+
- Backend: Java with Servlet API
- Communication: TCP Socket for watering system control
- Build: Maven with frontend-maven-plugin

## Prerequisites

- Node.js 14+
- Java 11+
- Maven 3.6+
- Access to watering system server

## Configuration

Before running the application, you need to set up your configuration files:

1. Backend Configuration:
   ```bash
   cp src/main/resources/application.properties.template src/main/resources/application.properties
   ```
   Then edit `application.properties` with your server details:
   ```properties
   watering.server.host=your_server_host
   watering.server.port=your_server_port
   ```

2. Frontend Configuration:
   ```bash
   cp src/environments/environment.template.ts src/environments/environment.ts
   cp src/environments/environment.template.ts src/environments/environment.prod.ts
   ```
   Then edit both files with your configuration:
   ```typescript
   export const environment = {
       production: false, // true for environment.prod.ts
       apiBasePath: '/wateringui/api',
       wateringSystem: {
           host: 'your_server_host',
           port: 'your_server_port'
       }
   };
   ```

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/oslucchi/wateringUI.git
   cd wateringUI
   ```

2. Set up configuration files as described in the Configuration section

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start development server:
   ```bash
   ng serve
   ```

5. Build for production:
   ```bash
   mvn clean package
   ```

The application will be available at `http://localhost:4200/`

## Deployment

The application is packaged as a WAR file for deployment to Tomcat or similar Java web containers.

1. Build the WAR file:
   ```bash
   mvn clean package
   ```

2. Deploy the generated WAR file from `target/wateringui.war` to your web container.

## Configuration

- Watering System Server: 192.168.200.103:9898
- Web Context Path: /wateringui/
- API Endpoint: /api/command

## License

This project is licensed under the MIT License - see the LICENSE file for details.
