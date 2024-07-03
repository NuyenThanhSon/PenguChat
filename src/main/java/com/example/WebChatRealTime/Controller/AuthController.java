package com.example.WebChatRealTime.Controller;

import com.example.WebChatRealTime.Entity.Role;
import com.example.WebChatRealTime.Entity.User;
import com.example.WebChatRealTime.Service.UserService;
import com.example.WebChatRealTime.dto.*;
import com.example.WebChatRealTime.jwt.JwtTokenUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
@Slf4j
public class AuthController {

    private final JwtTokenUtil jwtTokenUtil;
    private final UserService userDetailsService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<AuthRespDto> login(@RequestBody AuthReqDto authReqDto) {
        log.info("Login request received for user: {}", authReqDto.getUsername());

        // Authenticate user
        Authentication authenticate = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authReqDto.getUsername(), authReqDto.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authenticate);

        // Generate JWT token
        UserDetails userDetails = userDetailsService.loadUserByUsername(authReqDto.getUsername());
        String token = jwtTokenUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthRespDto(token, userDetails.getUsername()));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterRespDto> register(@RequestBody RegisterReqDto registerReqDto) {
        log.info("Register request received for user: {}", registerReqDto.getUsername());

        // Encode password
        String encodedPassword = passwordEncoder.encode(registerReqDto.getPassword());

        // Create new User object
        User newUser = User.builder()
                .email(registerReqDto.getEmail())
                .name(registerReqDto.getName())
                .username(registerReqDto.getUsername())
                .password(encodedPassword)
                .role(Role.ROLE_USER) // or Role.ROLE_ADMIN based on your requirement
                .build();

        // Save user using userDetailsService
        userDetailsService.saveUser(newUser);

        // Return successful response
        return ResponseEntity.ok(new RegisterRespDto("User registered successfully"));
    }

    @PostMapping("/update")
    public ResponseEntity<RegisterRespDto> updateUser(@RequestBody RegisterReqDto registerReqDto) {
        log.info("Update request received for user: {}", registerReqDto.getUsername());

        // Tìm người dùng hiện tại
        User existingUser = userDetailsService.findUserByUsername(registerReqDto.getUsername());
        if (existingUser == null) {
            return ResponseEntity.badRequest().body(new RegisterRespDto("User not found"));
        }

        // Cập nhật thông tin người dùng
        existingUser.setName(registerReqDto.getName());
        existingUser.setEmail(registerReqDto.getEmail());

        // Lưu người dùng
        userDetailsService.saveUser(existingUser);

        return ResponseEntity.ok(new RegisterRespDto("User updated successfully"));
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        User user = userDetailsService.findUserByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordDto changePasswordDto) {
        log.info("Change password request received for user: {}", changePasswordDto.getUsername());

        // Tìm người dùng hiện tại
        User existingUser = userDetailsService.findUserByUsername(changePasswordDto.getUsername());
        if (existingUser == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(changePasswordDto.getCurrentPassword(), existingUser.getPassword())) {
            return ResponseEntity.badRequest().body("Incorrect current password");
        }

        // Encode mật khẩu mới
        String encodedNewPassword = passwordEncoder.encode(changePasswordDto.getNewPassword());
        existingUser.setPassword(encodedNewPassword);

        // Lưu người dùng
        userDetailsService.saveUser(existingUser);

        log.info("Password changed successfully for user: {}", existingUser.getUsername());
        return ResponseEntity.ok("Password changed successfully");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response) {
        SecurityContextHolder.clearContext();

        log.info("User logged out successfully");

        return ResponseEntity.ok("Logout successful");
    }
}
