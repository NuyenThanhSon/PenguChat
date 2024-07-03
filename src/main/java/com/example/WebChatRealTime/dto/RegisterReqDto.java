package com.example.WebChatRealTime.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterReqDto {
    private String email;
    private String name;
    private String username;
    private String password;
}