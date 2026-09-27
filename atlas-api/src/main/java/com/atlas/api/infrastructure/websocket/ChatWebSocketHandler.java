package com.atlas.api.infrastructure.websocket;

import com.atlas.api.domain.dtos.out.LlmRequest;
import com.atlas.api.domain.port.out.LlmPort;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final LlmPort llmPort;
    private final ObjectMapper objectMapper;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("WebSocket connection established: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        log.info("Received chat message from {}: {}", session.getId(), message.getPayload());
        
        try {
            JsonNode rootNode = objectMapper.readTree(message.getPayload());
            String repoIdStr = rootNode.path("repoId").asText(null);
            String question = rootNode.path("question").asText(null);
            
            if (repoIdStr == null || question == null) {
                session.sendMessage(new TextMessage("{\"error\":\"repoId and question are required\"}"));
                return;
            }

            List<UUID> contextNodeIds = new ArrayList<>();
            JsonNode contextNodeIdsArr = rootNode.path("contextNodeIds");
            if (contextNodeIdsArr.isArray()) {
                for (JsonNode idNode : contextNodeIdsArr) {
                    contextNodeIds.add(UUID.fromString(idNode.asText()));
                }
            }

            LlmRequest request = LlmRequest.builder()
                    .repoId(UUID.fromString(repoIdStr))
                    .question(question)
                    .contextNodeIds(contextNodeIds)
                    .build();

            // Call Python AI service, streaming the chunks back to the WebSocket client
            llmPort.streamAnswer(request, token -> {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(token));
                    }
                } catch (IOException e) {
                    log.error("Failed to send token to websocket client {}", session.getId(), e);
                }
            });

            // Send a termination marker (e.g., [DONE]) so client knows stream finished
            if (session.isOpen()) {
                session.sendMessage(new TextMessage("[DONE]"));
            }

        } catch (Exception e) {
            log.error("Error handling websocket message", e);
            if (session.isOpen()) {
                session.sendMessage(new TextMessage("{\"error\":\"" + e.getMessage() + "\"}"));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.info("WebSocket connection closed: {}", session.getId());
    }
}
