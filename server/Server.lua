local onlinestaff = 0

RegisterServerEvent('getdata')
RegisterServerEvent('messagerecieved')
RegisterServerEvent('imagereceived')

AddEventHandler('getdata', function()
   if IsPlayerAceAllowed(source, Config.AcePerm) then
        TriggerClientEvent('openstaffchat', source, onlinestaff)
   end
end)

AddEventHandler('messagerecieved', function(data)
            local sourcename = GetPlayerName(source)
            local xPlayers = GetPlayers()
            local players = {}
            for i=1, #xPlayers, 1 do
            if IsPlayerAceAllowed(xPlayers[i], Config.AcePerm) then
            table.insert(players, {
                sourcex = xPlayers[i],
                name = GetPlayerName(xPlayers[i]),
            })
           TriggerClientEvent('sendmessage', -1, data, sourcename, players)
       end
    end
end)

AddEventHandler('imagereceived', function(data)
    local srcname = GetPlayerName(source)
    TriggerClientEvent('sendimage', -1, srcname, data)
end)

CreateThread(function()
    while true do
        onlinestaff = 0
        local xPlayers = GetPlayers()
        for i=1, #xPlayers, 1 do
            if IsPlayerAceAllowed(xPlayers[i], Config.AcePerm) then
                onlinestaff = onlinestaff + 1
            end
        end
        Wait(Config.RefreshTime * 1000)
    end
end)