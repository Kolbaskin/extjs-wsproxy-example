var http = require("http")
    ,port = 8008
    //,nodeStatic = 
    ,StaticServer = new(require('node-static').Server)(__dirname + '/static')
    ,WebSocketServer = require('websocket').server;  
// Содаем основной http-сервер
var server = http.createServer(function(req, res) {
    // По обычному http-запросу отдаем статический контент  
    StaticServer.serve(req, res)
})
// запускаем сервер
server.listen(8008, function() {
    console.log((new Date()) + ' Server is listening on port 8008');
});
// создаем websocket сервер
var wsServer = new WebSocketServer({
    // подключаем его к http-серверу
    httpServer: server, 
    // в документации рекомендуют отключать этот параметр,
    // что бы работала стандартная защита от кросс-доменных атак
    autoAcceptConnections: false
});
// добавим обработчик для запросов подключения по веб-сокету
wsServer.on('request', function(request) {
    wsRequestListener(request)
});
// обработчик для новых подключений
var wsRequestListener = function(request) {    
    var conn;
    try {
        // создадим соединение
        conn = request.accept('ws-my-protocol', request.origin);
    } catch(e) { /* ошибка */return;}    
    // подключим обработчик сообщений
    conn.on('message', function(message) {
        wsOnMessage(conn, message);
    });    
    // обработка закрытия сокета
    conn.on('close', function(reasonCode, description) {
        wsOnClose(conn, reasonCode, description);
    });    
}
// обработчик сообщений
var wsOnMessage = function(conn, message) {
    var request;
    // попытка парсинга входных данных в объект
    try {
        request = JSON.parse(message.utf8Data);
    } catch(e) {
        console.log('Error')
    }
    if(request && request.data) {
        // поиск подходящей модели и проверка наличия у модели заданного в запросе метода
        if(!!this[request.data.model] && !!this[request.data.model][request.data.action]) {
            // вызов метода модели и передача в него парамтров запроса
            this[request.data.model][request.data.action](request.data, function(responseData) {
                // в ответные данные добавляем служебную информацию,
                // по которой на клиенте будет найдена
                // соответствующая каллбэк функция
                // scope - идентификатор элемента-инициатора запроса на клиенте (store)    
                // opid - идентификатор операции
                responseData.scope = request.data.scope;
                if(request.opid)
                    responseData.opid = request.opid
                // передаем ответ клиенту
                conn.sendUTF(JSON.stringify({event: request.event, data: responseData}))
            })    
        }
    }
}
// обработчик закрытия сокета
var wsOnClose = function(conn, reasonCode, description) {
    console.log('ws close:', reasonCode)
}

// Объект с методами обработки данных
gridDataModel = {
    // чтение данных
    // data - параметры запроса (фильтры, сортировка, пейджинг и т.п.)
    // cb - каллбэк функция, куда нужно передать выходные данные
    read: function(data, cb) {
        cb({
            list: [{
                Author: 'Author1',
                Title: 'Title1',
                Manufacturer: 'Manufacturer1',
                ProductGroup: 'ProductGroup1',
                DetailPageURL: 'DetailPageURL1'
            },{
                Author: 'Author2',
                Title: 'Title2',
                Manufacturer: 'Manufacturer2',
                ProductGroup: 'ProductGroup2',
                DetailPageURL: 'DetailPageURL2'    
            }],
            total: 2 
        })
    }
}
