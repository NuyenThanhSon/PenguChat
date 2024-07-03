package com.example.WebChatRealTime.Repository;

import com.example.WebChatRealTime.Entity.Status;
import com.example.WebChatRealTime.Entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    List<User> findAllByStatus(Status status);
    Optional<User> findByUsername(String username);
}
