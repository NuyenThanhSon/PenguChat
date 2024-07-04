package com.example.WebChatRealTime.Entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document
public class GroupMember {
    @Id
    private String id;
    private String groupId;
    private String userId;
    private String role;
}
