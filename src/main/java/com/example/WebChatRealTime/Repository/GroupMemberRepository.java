package com.example.WebChatRealTime.Repository;

import com.example.WebChatRealTime.Entity.GroupMember;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface GroupMemberRepository extends MongoRepository<GroupMember, String> {
    List<GroupMember> findByGroupId(String groupId);
    void deleteByGroupIdAndUserId(String groupId, String userId);
    List<GroupMember> findByUserId(String userId);
}
