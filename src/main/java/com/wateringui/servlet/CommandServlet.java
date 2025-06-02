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

    private static class CommandRequest {
        private String cmd;
        public String getCmd() {
            return cmd;
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
        CommandRequest cmdRequest = gson.fromJson(jsonCommand, CommandRequest.class);
        String command = cmdRequest.getCmd();
        
        logger.info("Processing command: {}", command);

        CommandResponse cmdResponse = new CommandResponse();
        Socket socket = null;
        try {
            logger.debug("Attempting to connect to {}:{}", serverHost, serverPort);
            socket = new Socket(serverHost, serverPort);
            
            try (PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
                BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
                
                StringBuilder messageBuffer = new StringBuilder();
                boolean isMultilineResponse = false;
                String serverResponse;
                logger.debug("Waiting for server's prompt");
                serverResponse = in.readLine();
                logger.debug("Received response from socket: {}", serverResponse);

                logger.debug("Sending '{}' to socket", command);
                out.println(command);
                out.flush();

                while ((serverResponse = in.readLine()) != null) {
                    logger.debug("Received response from socket: {}", serverResponse);
                    if (serverResponse.startsWith("Watering admin> ")) {
                        serverResponse = serverResponse.substring("Watering admin> ".length());
                    }
                    
                    if ("ACK-M".equals(serverResponse)) {
                        isMultilineResponse = true;
                        continue;
                    }
                    else if ("ACK-ENDM".equals(serverResponse)) {
                        cmdResponse.setSuccess(true);
                        cmdResponse.setMessage(messageBuffer.toString());
                        break;
                    }
                    else if ("NACK".equals(serverResponse)) {
                        cmdResponse.setSuccess(false);
                        cmdResponse.setMessage("Command failed");
                        break;
                    }
                    else if ("ACK".equals(serverResponse)) {
                        cmdResponse.setSuccess(true);
                        cmdResponse.setMessage("Command executed successfully");
                        break;
                    }
                    else if (isMultilineResponse) {
                        if (messageBuffer.length() > 0) {
                            messageBuffer.append("\n");
                        }
                        messageBuffer.append(serverResponse);
                    }
                    else {
                        cmdResponse.setSuccess(false);
                        cmdResponse.setMessage("Unexpected response: " + serverResponse);
                        logger.warn("Unexpected response from server: {}", serverResponse);
                        break;
                    }
                }
                
                // Send quit command to properly close the connection
                logger.debug("Sending quit command");
                out.println("quit");
                String quitResponse = in.readLine();
                logger.debug("Quit command response: {}", quitResponse);
            }
        } catch (IOException e) {
            logger.error("Error executing command", e);
            cmdResponse.setSuccess(false);
            cmdResponse.setMessage("Error: " + e.getMessage());
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

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        ApiResponse apiResponse = new ApiResponse(cmdResponse.isSuccess(), cmdResponse.getMessage());
        String jsonResponse = gson.toJson(apiResponse);
        logger.debug("Sending response to client: {}", jsonResponse);
        response.getWriter().write(jsonResponse);
    }
} 