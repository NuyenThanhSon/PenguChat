package com.example.WebChatRealTime.Controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

@Controller
public class WebRTCSignalingController {

    @MessageMapping("/signal")
    @SendTo("/topic/signaling")
    public String signaling(@Payload String signal) {
        return signal;
    }

    @MessageMapping("/video-call")
    @SendToUser("/queue/video-call")
    public String videoCall(@Payload String signal) {
        return signal;
    }
}
