package com.example.WebChatRealTime.Repository;

import com.example.WebChatRealTime.Entity.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findByChatId(String chatId);
    @Query("{ '$or': [ { 'senderId': ?0, 'recipientId': ?1 }, { 'senderId': ?1, 'recipientId': ?0 } ] }")
    List<ChatMessage> findChatMessagesBetweenUsers(String senderId, String recipientId);
}
