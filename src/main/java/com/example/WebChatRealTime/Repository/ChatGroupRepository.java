package com.example.WebChatRealTime.Repository;

import com.example.WebChatRealTime.Entity.ChatGroup;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatGroupRepository extends MongoRepository<ChatGroup, String> {
    List<ChatGroup> findByIdIn(List<String> ids);
}
