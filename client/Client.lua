RegisterNetEvent('openstaffchat')
AddEventHandler('openstaffchat', function(onlinestaff)
    SetNuiFocus(true, true)
    SendNUIMessage({ 
        action = 'display',
        playername = GetPlayerName(PlayerId()),
        status = 'sent',
        staff = onlinestaff,
    })
end)

local open = false
RegisterCommand(Config.CommandName, function()
     TriggerServerEvent('getdata')
end)

RegisterNUICallback('exit', function(data, cb)
    SetNuiFocus(false, false) 
    open = false
end)

RegisterNUICallback('messagesent', function(data, cb)
    TriggerServerEvent('messagerecieved', data)
end)

RegisterNUICallback('imagesent', function(data, cb)
    TriggerServerEvent('imagereceived', data)
end)


RegisterNetEvent('sendmessage')
AddEventHandler('sendmessage', function(data, playername, players)
    for k,v in pairs(players) do
        if v.sourcex ~= source then
            SendNUIMessage({
                type = "sendmessage",
                message = data,
                sourcename = playername,
                playername = v.name
            })
        end
    end
end)

RegisterNetEvent('sendimage')
AddEventHandler('sendimage', function(sourcename, data) 
    SendNUIMessage({
        type = "sendimage",
        imagelink = data,
        srcname = sourcename,
    })
end)


RegisterNUICallback('exit', function(data, cb)
  SetNuiFocus(false, false) 
  open = false
end)