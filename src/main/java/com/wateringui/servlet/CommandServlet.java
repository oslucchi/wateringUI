package com.wateringui.servlet;

import com.google.gson.Gson;
import com.wateringui.model.CommandResponse;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.Socket;
import java.util.Properties;

@WebServlet("/api/command")
public class CommandServlet extends HttpServlet {
    private static final Logger logger = LogManager.getLogger(CommandServlet.class);
    private String serverHost;
    private int serverPort;
    private final Gson gson = new Gson();

    @Override
    public void init() {
        try {
            Properties props = new Properties();
            try (InputStream input = getClass().getClassLoader().getResourceAsStream("application.properties")) {
                if (input == null) {
                    throw new IOException("Unable to find application.properties");
                }
                props.load(input);
            }
            serverHost = props.getProperty("watering.server.host");
            serverPort = Integer.parseInt(props.getProperty("watering.server.port"));
            logger.info("Initialized with server configuration: {}:{}", serverHost, serverPort);
        } catch (Exception e) {
            logger.error("Failed to load configuration", e);
            throw new RuntimeException("Failed to initialize servlet", e);
        }
    }

    private static class ApiResponse {
        private String status;
        private String data;

        public ApiResponse(boolean success, String message) {
            this.status = success ? "OK" : "NOK";
            this.data = message;
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        logger.debug("Received command request");
        
        StringBuilder buffer = new StringBuilder();
        String line;
        try (BufferedReader reader = request.getReader()) {
            while ((line = reader.readLine()) != null) {
                buffer.append(line);
            }
        }

        String jsonCommand = buffer.toString();
        logger.info("Processing command: {}", jsonCommand);

        Socket socket = null;
        try {
            logger.debug("Attempting to connect to {}:{}", serverHost, serverPort);
            socket = new Socket(serverHost, serverPort);
            
            try (PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
                BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
                
                // Send the JSON command
                logger.debug("Sending command to socket: {}", jsonCommand);
                out.println(jsonCommand);
                out.flush();

                // Read the response
                String serverResponse = in.readLine();
                logger.debug("Received response from socket: {}", serverResponse);

                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write(serverResponse != null ? serverResponse : "{}");
            }
        } catch (IOException e) {
            logger.error("Error executing command", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(gson.toJson(new ApiResponse(false, "Error: " + e.getMessage())));
        } finally {
            if (socket != null && !socket.isClosed()) {
                try {
                    logger.debug("Closing socket connection");
                    socket.close();
                } catch (IOException e) {
                    logger.error("Error closing socket", e);
                }
            }
        }
    }
} 