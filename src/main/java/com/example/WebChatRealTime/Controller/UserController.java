package com.example.WebChatRealTime.Controller;

import com.example.WebChatRealTime.Entity.ChatGroup;
import com.example.WebChatRealTime.Entity.ChatMessage;
import com.example.WebChatRealTime.Entity.GroupMember;
import com.example.WebChatRealTime.Entity.User;
import com.example.WebChatRealTime.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @MessageMapping("/user.addUser")
    @SendTo("/user/public")
    public User addUser(@Payload User user) {
        userService.saveUser(user);
        return user;
    }

    @MessageMapping("/user.disconnectUser")
    @SendTo("/user/public")
    public User disconnectUser(
            @Payload User user
    ) {
        userService.disconnect(user);
        return user;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> findConnectedUsers() {
        return ResponseEntity.ok(userService.findConnectedUsers());
    }
    @MessageMapping("/group/create")
    @SendTo("/group/public")
    public ChatGroup createGroup(@Payload ChatGroup chatGroup) {
        return userService.createGroup(chatGroup);
    }

    @GetMapping("/groups")
    public ResponseEntity<List<ChatGroup>> getAllGroups() {
        return ResponseEntity.ok(userService.getAllGroups());
    }

    @PostMapping("/group/addUser")
    public ResponseEntity<GroupMember> addUserToGroup(@RequestBody GroupMember groupMember) {
        return ResponseEntity.ok(userService.addUserToGroup(groupMember.getGroupId(), groupMember.getUserId(), groupMember.getRole()));
    }

    @PostMapping("/group/removeUser")
    public ResponseEntity<Void> removeUserFromGroup(@RequestBody GroupMember groupMember) {
        userService.removeUserFromGroup(groupMember.getGroupId(), groupMember.getUserId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/group/{groupId}/members")
    public ResponseEntity<List<GroupMember>> getGroupMembers(@PathVariable String groupId) {
        return ResponseEntity.ok(userService.getGroupMembers(groupId));
    }
    @GetMapping("/user/{userId}/groups")
    public ResponseEntity<List<ChatGroup>> getUserGroups(@PathVariable String userId) {
        List<GroupMember> groupMembers = userService.getGroupMemberships(userId);
        List<String> groupIds = groupMembers.stream()
                .map(GroupMember::getGroupId)
                .collect(Collectors.toList());
        List<ChatGroup> userGroups = userService.getGroupsByIds(groupIds);
        return ResponseEntity.ok(userGroups);
    }
    @GetMapping("/messages/last/{senderId}/{recipientId}")
    public ResponseEntity<ChatMessage> getLastMessage(@PathVariable String senderId, @PathVariable String recipientId) {
        Optional<ChatMessage> lastMessage = userService.getLastMessageBetweenUsers(senderId, recipientId);
        return lastMessage.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

}
