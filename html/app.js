let messageListener = null;
let staffList = null;
let chatlog = null;
let lastMessageTime = 0;
let draggable = false;
let notisoff = false;
const delayBetweenMessages = 1000; // 1 second(s)
const delayBetweenNotifications = 100;

$(document).ready(function () {
  interact('.chatbox')
    .draggable({
      inertia: true,
      autoScroll: true,
      enabled: draggable,
      listeners: {
        move: dragMoveListener,

        start(event) {
          event.target.classList.add('dragging');
        },
        end(event) {
          event.target.classList.remove('dragging');
        }
      }
    });

  function dragMoveListener(event) {
    var target = event.target
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
  }
});

function notify(message) {
  const checktime = new Date().getTime();
  if (!notisoff && checktime - lastMessageTime >= delayBetweenNotifications) {
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
    lastMessageTime = checktime;
  }
};

function addImage(sourcename, imagelink) {
  if (!imagelink) return notify('Please Insert a Valid Image Link.')
  const image = document.createElement('img');
  const messageElement = document.createElement('div');
  image.setAttribute('src', imagelink);
  chatlog.appendChild(image);
  messageElement.classList.add('message', 'received');
  messageElement.textContent = `Image Sent By: [${sourcename}]`;
  messageElement.appendChild(image);
  image.addEventListener('click', () => {
    if (image.classList.contains('activeimg')) {
      image.classList.remove('activeimg');
      messageElement.appendChild(image);
    } else {
      image.classList.add('activeimg');
      document.body.appendChild(image);
    }
  });
  chatlog.appendChild(messageElement);
  chatlog.scrollTop = chatlog.scrollHeight;
}

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
      $('img').attr('src', 'nil');
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
  }
};

window.addEventListener('message', function (event) {
  if (event.data.action === 'display') {
    ShowAll()
    const form = document.querySelector('form');
    const messageInput = document.querySelector('.message-input');
    chatlog = document.querySelector('.chatlog');
    staffList = event.data.staff;
    $('#drag').change(function () {
      if ($(this).is(':checked')) {
        notify('Drag Mode Enabled.');
        draggable = true;
        interact('.chatbox').draggable({ enabled: draggable });
      } else {
        notify('Drag Mode Disabled.');
        draggable = false;
        interact('.chatbox').draggable({ enabled: draggable });
      }
    });
    $('#notifications').change(function () {
      if ($(this).is(':checked')) {
        notify('Notifications Disabled');
        notisoff = true;
      } else {
        notify('Notifications Enabled');
        notisoff = false;
      }
    });
    $('.onlinestaff').html(`Online Staff: [${staffList}]`);
    $('#chatbox-exit').click(function () {
      CloseAll()
    });
    $('#settings-exit').click(function () {
      $('.settingsbox').hide("scale", 200);
    });
    // if ($('#drag').prop('checked')) {
    //   notify('Drag Mode Enabled.');
    //   draggable = true;
    //   interact('.chatbox').draggable({ enabled: draggable });
    // } else {
    // notify('Drag Mode Disabled.');
    // draggable = false;
    // interact('.chatbox').draggable({ enabled: draggable });
    // }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const message = messageInput.value.trim();
      if (message.startsWith('/image')) {
        const imageUrl = message.substring(6).trim(); // extract the URL after "/image"
        $.post(`https://${GetParentResourceName()}/imagesent`, JSON.stringify(imageUrl));
      }
      else if (message) {
        $.post(`https://${GetParentResourceName()}/messagesent`, JSON.stringify(message));
      }
      messageInput.value = '';
    });
  }
  if (event.data.type === "sendmessage") {
    const messageInput = document.querySelector('.message-input');
    const sourcename = event.data.sourcename;
    const message = event.data.message;
    const playername = event.data.playername;
    if ($('.chatbox').is(':visible')) {
      addMessage(sourcename, message, playername);
    } else {
      notify(`${sourcename} Sent a New Message!`)
      addMessage(sourcename, message, playername);
    }
    messageInput.value = '';
  }
  if(event.data.type === "sendimage") {
    const messageInput = document.querySelector('.message-input');
    const sourcename = event.data.srcname;
    const imagelink = event.data.imagelink;
    if ($('.chatbox').is(':visible')) {
      addImage(sourcename, imagelink);
    } else {
      notify(`${sourcename} Sent a New Image!`)
      addImage(sourcename, imagelink);
    }
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

$(document).keydown((e) => {
  if (e.key === "Escape") {
    CloseAll()
  }
});

function ShowAll() {
  $('.chatbox').show("scale", 200);
  $('body').show();
};

$(document).ready(function() {
  $('.open-settings').click(function () {
    if ($('.settingsbox').is(":visible")) {
    $('.settingsbox').hide('scale', 200);
    }
    else {
    $('.settingsbox').show('scale', 200);
    }
  });
})

function playsound() {
  $("<audio></audio>").attr({
    'src': 'sounds/select.wav',
    'volume': 5.0,
    'autoplay': 'autoplay'
  }).appendTo("body");
};

function CloseAll() {
  $(".chatbox").hide("scale", 200);
  $(".settingsbox").hide("scale", 200);
  $.post(`https://${GetParentResourceName()}/exit`, JSON.stringify({}));
};