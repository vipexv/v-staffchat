fx_version 'cerulean'
game 'gta5'
author 'vipex#2027'
description 'V-Staff Chat'
fx_version '1.01'

client_scripts {
	-- "configs/*",
	"client/*",
}

server_scripts {
	-- "configs/*",
	"server/*",
}

shared_scripts {
    'Shared.lua'
}

ui_page 'html/index.html'

files {
	'html/index.html',
	'html/style.css',
	'html/app.js',
	'html/sounds/select.wav'
}

lua54 'yes'
