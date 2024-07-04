package com.example.WebChatRealTime.Service;


import com.example.WebChatRealTime.Entity.*;
import com.example.WebChatRealTime.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository repository;
    private final ChatGroupRepository chatGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    public void saveUser(User user) {
        user.setStatus(Status.ONLINE);
        repository.save(user);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public User findUserByUsername(String username) {
        return repository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    public void disconnect(User user) {
        var storedUser = repository.findById(user.getUsername()).orElse(null);
        if (storedUser != null) {
            storedUser.setStatus(Status.OFFLINE);
            repository.save(storedUser);
        }
    }

    public List<User> findConnectedUsers() {
        return repository.findAllByStatus(Status.ONLINE);
    }

    public ChatGroup createGroup(ChatGroup chatGroup) {
        ChatGroup savedGroup = chatGroupRepository.save(chatGroup);

        // Add creator as group member with ADMIN role
        GroupMember groupMember = new GroupMember();
        groupMember.setGroupId(savedGroup.getId());
        groupMember.setUserId(chatGroup.getCreatorId());
        groupMember.setRole("ADMIN");
        groupMemberRepository.save(groupMember);

        // Create chat room for the group
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setChatId(savedGroup.getId());
        chatRoom.setSenderId(chatGroup.getCreatorId());
        chatRoom.setRecipientId(null);
        chatRoomRepository.save(chatRoom);

        return savedGroup;
    }
    public GroupMember addUserToGroup(String groupId, String userId, String role) {
        GroupMember groupMember = new GroupMember();
        groupMember.setGroupId(groupId);
        groupMember.setUserId(userId);
        groupMember.setRole(role);
        return groupMemberRepository.save(groupMember);
    }

    public void removeUserFromGroup(String groupId, String userId) {
        groupMemberRepository.deleteByGroupIdAndUserId(groupId, userId);
    }

    public List<GroupMember> getGroupMembers(String groupId) {
        return groupMemberRepository.findByGroupId(groupId);
    }

    public List<ChatGroup> getAllGroups() {
        return chatGroupRepository.findAll();
    }

    public List<GroupMember> getGroupMemberships(String userId) {
        return groupMemberRepository.findByUserId(userId);
    }

    public List<ChatGroup> getGroupsByIds(List<String> groupIds) {
        return chatGroupRepository.findByIdIn(groupIds);
    }
    public Optional<ChatMessage> getLastMessageBetweenUsers(String senderId, String recipientId) {
        List<ChatMessage> messages = chatMessageRepository.findChatMessagesBetweenUsers(senderId, recipientId);
        return messages.stream().max(Comparator.comparing(ChatMessage::getTimestamp));
    }
}
