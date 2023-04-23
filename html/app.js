let messageListener = null;
let staffList = null;
let chatlog = null;
let lastMessageTime = 0;
const delayBetweenMessages = 1000; // 1 second(s)

function notify(message) {
  const notification = document.createElement('div');
  const notificationmessage = document.createElement('div');
  notification.classList.add('notificationdiv');
  notificationmessage.classList.add('notificationmessage');

  document.body.appendChild(notification);
  notification.appendChild(notificationmessage);
  notificationmessage.innerHTML = `<i class="fa-solid fa-circle-exclamation ratio"></i> | ${message}`;
  playsound();
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 2000);
};

function addImage(sourcename, imagelink) {
  const image = document.createElement('img');
  const messageElement = document.createElement('div');
  image.setAttribute('src', imagelink);
  chatlog.appendChild(image);
  messageElement.classList.add('message', 'received');
  messageElement.textContent = `Image Sent By: [${sourcename}]`;
  chatlog.appendChild(messageElement)
  image.addEventListener('click', () => {
    if (image.classList.contains('activeimg')) {
      image.classList.remove('activeimg');
      chatlog.appendChild(image);
    } else {
      image.classList.add('activeimg');
      document.body.appendChild(image);
    }
  });
  chatlog.scrollTop = chatlog.scrollHeight;
};

function addMessage(sourcename, message, playername) {
  const messages = chatlog.querySelectorAll('.message');
  const lastMessage = messages[messages.length - 1];
  const lastMessageContent = lastMessage ? lastMessage.textContent : '';

  const currentTime = new Date().getTime();
  if (lastMessageContent !== `[${sourcename}]: ${message}` || currentTime - lastMessageTime >= delayBetweenMessages) {
    const messageElement = document.createElement('div');
    if (message.toLowerCase() === "/clear") {
    notify('Cleared the Chat!')
    chatlog.innerHTML = "";
    return;
    }
      if (sourcename !== playername) {
        messageElement.classList.add('message', 'received');
        messageElement.textContent = `[${sourcename}]: ${message}`;
      } else {
        messageElement.classList.add('message', 'sent');
        messageElement.textContent = `[${sourcename}]: ${message}`;
      }
  
    chatlog.appendChild(messageElement);
    chatlog.scrollTop = chatlog.scrollHeight;

    lastMessageTime = currentTime;
  // }
  }
};

window.addEventListener('message', function (event) {
  if (event.data.action === 'display') {
    ShowAll()
    const form = document.querySelector('form');
    const messageInput = document.querySelector('.message-input');
    chatlog = document.querySelector('.chatlog');
    // const playername = event.data.playername;
    // const status = event.data.status;
    staffList = event.data.staff;
    $('.onlinestaff').html(`Online Staff: [${staffList}]`);
    $('.exit').click(function () {
      CloseAll()
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const message = messageInput.value.trim();
      if (message.startsWith('/image')) {
        const imageUrl = message.substring(6).trim(); // extract the URL after "/image"
        $.post(`https://${GetParentResourceName()}/imagesent`, JSON.stringify(imageUrl));
      }
      else if (message) {
        $.post(`https://${GetParentResourceName()}/messagesent`, JSON.stringify(message));
        messageInput.value = '';
      }
    });
  }
  if (event.data.type === "sendmessage") {
    const messageInput = document.querySelector('.message-input');
    const sourcename = event.data.sourcename;
    const message = event.data.message;
    const playername = event.data.playername;
    addMessage(sourcename, message, playername);
    messageInput.value = '';
  }
  if(event.data.type === "sendimage") {
    const messageInput = document.querySelector('.message-input');
    const sourcename = event.data.srcname;
    const imagelink = event.data.imagelink;
    addImage(sourcename, imagelink);
    messageInput.value = '';
  } 
});

$(function () {
  setInterval(() => {
    if (messageListener) {
      $.post(`https://${GetParentResourceName()}/getonlinestaff`, JSON.stringify({}));
    }
  }, 60000);
});

$(document).on('dataReceived', function (event, data) {
  if (messageListener && data.onlinestaff) {
    staffList = data.onlinestaff;
    $('.onlinestaff').html(`Online Staff: [${staffList}]`);
  }
});

$(document).keyup((e) => {
  if (e.key === "Escape") {
    CloseAll()
  }
});

function ShowAll() {
  $('.chatbox').removeClass('hidden');
  $('.chatbox').show();
  $('body').show();
};

function playsound() {
  $("<audio></audio>").attr({
    'src': 'sounds/select.wav',
    'volume': 5.0,
    'autoplay': 'autoplay'
  }).appendTo("body");
};

function CloseAll() {
  $('.chatbox').addClass('hidden');
  setTimeout(function () {
    $('.chatbox').hide();
    $('body').hide();
  }, 200);
  $.post(`https://${GetParentResourceName()}/exit`, JSON.stringify({}));
};

function isImageUrl(url) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  return imageExtensions.some(ext => url.endsWith(ext));
};