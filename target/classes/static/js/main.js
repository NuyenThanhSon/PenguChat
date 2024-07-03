'use strict';

const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const usernameForm = document.querySelector('#login-form');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const connectingElement = document.querySelector('.connecting');
const chatArea = document.querySelector('#chat-messages');
const logout = document.querySelector('.logout');

let stompClient = null;
let username = null;
let password = null;
let name = null;
let email = null;
let selectedUserId = null;

function connect(event) {
    event.preventDefault();
    username = localStorage.getItem('username');
    password = document.querySelector('#password').value;
    if (username && password) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        const token = localStorage.getItem('token');
        stompClient.connect({ Authorization: `Bearer ${token}` }, onConnected, onError);
    }
}

function onConnected() {
    const username = localStorage.getItem('username');
    const userQueueDestination = `/user/${username}/queue/messages`;
    stompClient.subscribe(userQueueDestination, onMessageReceived);
    stompClient.subscribe('/user/public', onMessageReceived);

    stompClient.send("/app/user.addUser",
        {},
        JSON.stringify({ username: username, status: 'ONLINE' })
    );
    findAndDisplayConnectedUsers();
}
async function findAndDisplayConnectedUsers() {
    try {
        const response = await fetch('/users');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const connectedUsers = await response.json();
        const connectedUsersList = document.getElementById('connectedUsers');
        connectedUsersList.innerHTML = '';

        connectedUsers.forEach(user => {
            appendUserElement(user, connectedUsersList);
            if (connectedUsers.indexOf(user) < connectedUsers.length - 1) {
                const separator = document.createElement('li');
                separator.classList.add('separator');
                connectedUsersList.appendChild(separator);
            }
        });
    } catch (error) {
        console.error('Error fetching connected users:', error);
    }
}

function appendUserElement(user, connectedUsersList) {
    const listItem = document.createElement('li');
    listItem.classList.add('user-item');
    listItem.id = user.username;

    const anchorTag = document.createElement('a');
    anchorTag.setAttribute('data-conversation', '#conversation-1');
    anchorTag.addEventListener('click', userItemClick);

    const userImage = document.createElement('img');
    userImage.classList.add('content-message-image');
    userImage.src = './src/social-media-chatting-online-blank-profile-picture-head-and-body-icon-people-standing-icon-grey-background-free-vector.jpg';
    userImage.alt = '';

    const messageInfoSpan = document.createElement('span');
    messageInfoSpan.classList.add('content-message-info');

    const nameSpan = document.createElement('span');
    nameSpan.classList.add('content-message-name');
    nameSpan.textContent = user.password;

    const textSpan = document.createElement('span');
    textSpan.classList.add('content-message-text');
    textSpan.textContent = 'Lorem ipsum dolor sit amet consectetur.';

    const moreSpan = document.createElement('span');
    moreSpan.classList.add('content-message-more');

    const unreadSpan = document.createElement('span');
    unreadSpan.classList.add('content-message-unread');
    unreadSpan.textContent = '1';

    const timeSpan = document.createElement('span');
    timeSpan.classList.add('content-message-time');
    timeSpan.textContent = '12:30';

    moreSpan.appendChild(unreadSpan);
    moreSpan.appendChild(timeSpan);

    messageInfoSpan.appendChild(nameSpan);
    messageInfoSpan.appendChild(textSpan);

    anchorTag.appendChild(userImage);
    anchorTag.appendChild(messageInfoSpan);
    anchorTag.appendChild(moreSpan);

    listItem.appendChild(anchorTag);
    listItem.addEventListener('click', userItemClick);

    connectedUsersList.appendChild(listItem);
}

function userItemClick(event) {
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    messageForm.classList.remove('hidden');

    const clickedUser = event.currentTarget;
    clickedUser.classList.add('active');

    selectedUserId = clickedUser.getAttribute('id');
    fetchAndDisplayUserChat().then();

    const nbrMsg = clickedUser.querySelector('.content-message-unread');
    nbrMsg.classList.add('hidden');
    nbrMsg.textContent = '0';
    var user = clickedUser.querySelector('.content-message-name');
    var userTitle = document.querySelector('.conversation-user-name')
    userTitle.textContent = user.textContent
}

function displayMessage(senderId, content, fileName, fileType, fileContentBase64) {
    const messageContainer = document.createElement('li');
    messageContainer.classList.add('conversation-item');
    if (senderId === username) {
        // messageContainer.classList.add('sender');
    } else {
        messageContainer.classList.add('me');
    }

    const itemSide = document.createElement('div');
    itemSide.classList.add('conversation-item-side');

    const userImage = document.createElement('img');
    userImage.classList.add('conversation-item-image');
    userImage.src = './src/social-media-chatting-online-blank-profile-picture-head-and-body-icon-people-standing-icon-grey-background-free-vector.jpg';
    userImage.alt = '';

    itemSide.appendChild(userImage);

    const itemContent = document.createElement('div');
    itemContent.classList.add('conversation-item-content');

    const itemWrapper = document.createElement('div');
    itemWrapper.classList.add('conversation-item-wrapper');

    const itemBox = document.createElement('div');
    itemBox.classList.add('conversation-item-box');

    const itemText = document.createElement('div');
    itemText.classList.add('conversation-item-text');

    if (fileName && fileType && fileContentBase64) {
        if (fileType.startsWith('image/')) {
            const image = document.createElement('img');
            image.src = `data:${fileType};base64,${fileContentBase64}`;
            image.alt = fileName;
            image.style.maxWidth = '200px';
            itemText.appendChild(image);
        } else {
            const link = document.createElement('a');
            link.href = `data:${fileType};base64,${fileContentBase64}`;
            link.download = fileName;
            link.textContent = fileName;
            itemText.appendChild(link);
        }
    } else {
        const message = document.createElement('p');
        message.textContent = content;
        itemText.appendChild(message);
    }

    const messageTime = document.createElement('div');
    messageTime.classList.add('conversation-item-time');
    messageTime.textContent = new Date().toLocaleTimeString();

    itemText.appendChild(messageTime);

    const itemDropdown = document.createElement('div');
    itemDropdown.classList.add('conversation-item-dropdown');

    const dropdownToggle = document.createElement('button');
    dropdownToggle.type = 'button';
    dropdownToggle.classList.add('conversation-item-dropdown-toggle');
    dropdownToggle.innerHTML = '<i class="ri-more-2-line"></i>';

    const dropdownList = document.createElement('ul');
    dropdownList.classList.add('conversation-item-dropdown-list');

    const shareItem = document.createElement('li');
    const shareLink = document.createElement('a');
    shareLink.href = '#';
    shareLink.innerHTML = '<i class="ri-share-forward-line"></i> Share';
    shareItem.appendChild(shareLink);

    const deleteItem = document.createElement('li');
    const deleteLink = document.createElement('a');
    deleteLink.href = '#';
    deleteLink.innerHTML = '<i class="ri-delete-bin-line"></i> Delete';
    deleteItem.appendChild(deleteLink);

    dropdownList.appendChild(shareItem);
    dropdownList.appendChild(deleteItem);

    itemDropdown.appendChild(dropdownToggle);
    itemDropdown.appendChild(dropdownList);

    itemBox.appendChild(itemText);
    itemBox.appendChild(itemDropdown);

    itemWrapper.appendChild(itemBox);

    itemContent.appendChild(itemWrapper);

    messageContainer.appendChild(itemSide);
    messageContainer.appendChild(itemContent);

    chatArea.appendChild(messageContainer);
}

async function fetchAndDisplayUserChat() {
    const userChatResponse = await fetch(`/messages/${username}/${selectedUserId}`);
    const userChat = await userChatResponse.json();
    chatArea.innerHTML = '';
    userChat.forEach(chat => {
        displayMessage(chat.senderId, chat.content, chat.fileName, chat.fileType, chat.fileContentBase64);
    });
    chatArea.scrollTop = chatArea.scrollHeight;
}

function onError() {
//    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
//    connectingElement.style.color = 'red';
}

function sendMessage(event) {
    const messageContent = messageInput.value.trim();
    if (messageContent || fileInput.files.length > 0) {
        if (stompClient) {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                reader.onload = () => {
                    const base64String = reader.result.split(',')[1];
                    const chatMessage = {
                        senderId: username,
                        recipientId: selectedUserId,
                        fileName: file.name,
                        fileType: file.type,
                        fileContentBase64: base64String,
                        timestamp: new Date()
                    };
                    stompClient.send("/app/chat/file", {}, JSON.stringify(chatMessage));
                    displayMessage(username, '', file.name, file.type, base64String);
                };
                reader.readAsDataURL(file);
            } else {
                const chatMessage = {
                    senderId: username,
                    recipientId: selectedUserId,
                    content: messageContent,
                    timestamp: new Date()
                };
                stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
                displayMessage(username, messageContent);
            }
        }
        messageInput.value = '';
        fileInput.value = ''; // Reset file input
    }
    chatArea.scrollTop = chatArea.scrollHeight;
    event.preventDefault();
}

async function onMessageReceived(payload) {
    await findAndDisplayConnectedUsers();
    const message = JSON.parse(payload.body);

    if (selectedUserId && selectedUserId === message.senderId) {
        displayMessage(message.senderId, message.content, message.fileName, message.fileType, message.fileContentBase64);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    if (selectedUserId) {
        document.querySelector(`#${selectedUserId}`).classList.add('active');
    } else {
        messageForm.classList.add('hidden');
    }

    const notifiedUser = document.querySelector(`#${message.senderId}`);
    if (notifiedUser && !notifiedUser.classList.contains('active')) {
        const nbrMsg = notifiedUser.querySelector('.content-message-unread');
        nbrMsg.classList.remove('hidden');
        nbrMsg.textContent = '';
    }
}

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.style.display = 'none';

document.querySelector('.conversation-form-button').addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            sendFile(base64String, file.name, file.type);
        };
        reader.readAsDataURL(file);
    }
});

function sendFile(base64String, fileName, fileType) {
    if (stompClient) {
        const fileMessage = {
            senderId: username,
            recipientId: selectedUserId,
            fileName: fileName,
            fileType: fileType,
            fileContentBase64: base64String,
            timestamp: new Date()
        };
        stompClient.send("/app/chat/file", {}, JSON.stringify(fileMessage));
        displayMessage(username, '', fileName, fileType, base64String);
    }
}

function onLogout() {
    stompClient.send("/app/user.disconnectUser",
        {},
        JSON.stringify({username: username, password: password, status: 'OFFLINE'})
    );
    window.location.reload();
}


/*============================== CHAT VIDEO CALL ================================*/
//    var stompClient = null;
    var signalingClient = null;
        var videoCallClient = null;
        var localStream = null;
        var pc = null;
        const peerConnectionConfig = {
            'iceServers': [
                { 'urls': 'stun:stun.stunprotocol.org:3478' }
            ]
        };

        function connectCall() {
            var socket = new SockJS('/ws');
            stompClient = Stomp.over(socket);

            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                stompClient.subscribe('/user/queue/messages', function (message) {
                    showMessage(JSON.parse(message.body).content);
                });

                signalingSocket = new SockJS('/signal');
                signalingClient = Stomp.over(signalingSocket);

                signalingClient.connect({}, function (frame) {
                    console.log('Signaling connected: ' + frame);
                    signalingClient.subscribe('/topic/signaling', function (message) {
                        handleSignalingData(JSON.parse(message.body));
                    });
                });

                var videoCallSocket = new SockJS('/video-call');
                videoCallClient = Stomp.over(videoCallSocket);

                videoCallClient.connect({}, function (frame) {
                    console.log('Video Call connected: ' + frame);
                    videoCallClient.subscribe('/user/queue/video-call', function (message) {
                        handleVideoCallRequest(JSON.parse(message.body));
                    });
                });
            });
        }

        function handleSignalingData(data) {
            switch (data.type) {
                case 'offer':
                    pc.setRemoteDescription(new RTCSessionDescription(data));
                    pc.createAnswer().then(answer => {
                        pc.setLocalDescription(answer);
                        signalingClient.send('/app/signal', {}, JSON.stringify(answer));
                    });
                    break;
                case 'answer':
                    pc.setRemoteDescription(new RTCSessionDescription(data));
                    break;
                case 'candidate':
                    pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                    break;
                case 'end-call':
                    stopCall();
                    break;
            }
        }

        function handleVideoCallRequest(data) {
            if (confirm('You have an incoming video call. Do you want to accept it?')) {
                startCall(true);
            }
        }

        function startCall(isReceiver) {
            pc = new RTCPeerConnection(peerConnectionConfig);

            pc.onicecandidate = function (event) {
                if (event.candidate) {
                    signalingClient.send('/app/signal', {}, JSON.stringify({ 'type': 'candidate', 'candidate': event.candidate }));
                }
            };

            pc.ontrack = function (event) {
                document.getElementById('remoteVideo').srcObject = event.streams[0];
            };

            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                localStream = stream;
                document.getElementById('localVideo').srcObject = stream;
                stream.getTracks().forEach(track => pc.addTrack(track, stream));

                if (!isReceiver) {
                    pc.createOffer().then(offer => {
                        pc.setLocalDescription(offer);
                        signalingClient.send('/app/signal', {}, JSON.stringify(offer));
                    });

                    videoCallClient.send('/app/video-call', {}, JSON.stringify({ type: 'video-call-request' }));
                }

                document.getElementById('stopCall').disabled = false;
                document.getElementById('startCall').disabled = true;
            }).catch(error => {
                console.error('Error accessing media devices.', error);
            });
        }

        function stopCall() {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                localStream = null;
            }
            if (pc) {
                pc.close();
                pc = null;
            }
            signalingClient.send('/app/signal', {}, JSON.stringify({ type: 'end-call' }));
            document.getElementById('localVideo').srcObject = null;
            document.getElementById('remoteVideo').srcObject = null;
            document.getElementById('stopCall').disabled = true;
            document.getElementById('startCall').disabled = false;
        }

        window.onload = function () {
            connectCall();
            document.getElementById('startCall').onclick = function () { startCall(false); };
            document.getElementById('stopCall').onclick = function () { stopCall(); };
        };


// ========================================= Create Group ==========================================
let selectedUsers = new Set();

function showGroupForm() {
    document.getElementById('groupFormPopup').style.display = 'block';
    fetchUsers();
}

function closeGroupForm() {
    document.getElementById('groupFormPopup').style.display = 'none';
    selectedUsers.clear();
}

function fetchUsers() {
    fetch('/users')
        .then(response => response.json())
        .then(users => {
            const userList = document.getElementById('userList');
            userList.innerHTML = '';
            users.forEach(user => {
                const userItem = document.createElement('div');
                userItem.classList.add('user-item');
                userItem.textContent = user.password;
                userItem.dataset.userId = user.username;
                userItem.onclick = () => toggleUserSelection(userItem);
                userList.appendChild(userItem);
            });
        })
        .catch(error => console.error('Error fetching users:', error));
}

function toggleUserSelection(userItem) {
    const userId = userItem.dataset.userId;
    if (selectedUsers.has(userId)) {
        selectedUsers.delete(userId);
        userItem.classList.remove('selected');
    } else {
        selectedUsers.add(userId);
        userItem.classList.add('selected');
    }
}

function searchUser() {
    const input = document.getElementById('searchUser');
    const filter = input.value.toLowerCase();
    const userList = document.getElementById('userList');
    const userItems = userList.getElementsByClassName('user-item');

    Array.from(userItems).forEach(userItem => {
        const text = userItem.textContent || userItem.innerText;
        if (text.toLowerCase().indexOf(filter) > -1) {
            userItem.style.display = '';
        } else {
            userItem.style.display = 'none';
        }
    });
}

function createGroup() {
    const groupName = document.getElementById('groupName').value;
    const creatorId = 'currentUser'; // Replace with the actual current user ID

    const groupData = {
        name: groupName,
        creatorId: creatorId,
        createdDate: new Date()
    };

    fetch('/group/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
    })
    .then(response => response.json())
    .then(group => {
        const groupId = group.id;
        selectedUsers.forEach(userId => {
            const groupMemberData = {
                groupId: groupId,
                userId: userId,
                role: 'MEMBER'
            };
            fetch('/group/addUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(groupMemberData),
            })
            .then(response => response.json())
            .then(member => {
                console.log('Added member:', member);
            })
            .catch(error => console.error('Error adding member:', error));
        });
        console.log('Group created:', group);
        closeGroupForm();
        addGroupToSidebar(group);
    })
    .catch(error => console.error('Error creating group:', error));
}

function addGroupToSidebar(group) {
    // Add the newly created group to the sidebar or wherever you display groups
    const groupList = document.getElementById('groupList'); // Make sure this element exists in your HTML
    const groupItem = document.createElement('div');
    groupItem.classList.add('group-item');
    groupItem.textContent = group.name;
    groupItem.dataset.groupId = group.id;
    groupItem.onclick = () => openChatRoom(group.id);
    groupList.appendChild(groupItem);
}

function openChatRoom(groupId) {
    // Logic to open the chat room for the given group
    console.log('Opening chat room for group:', groupId);
}


//==================== Xử lý ======================
usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
logout.addEventListener('click', onLogout, true);