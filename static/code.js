Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Ext.ux': 'src/ux'
    }
});
Ext.onReady(function(){ 
    // определим тип протокола (защищенный или открытый)
    var protocol = location.protocol == 'https:'? 'wss':'ws';
    // Создадим веб-сокет
    var WS = Ext.create('Ext.ux.WebSocket', {
        url: protocol + "://" + location.host + "/" ,
        protocol: "ws-my-protocol",
        communicationType: 'event'
    });     
    var proxy = Ext.create('Ext.ux.data.proxy.WebSocket',{
        storeId: 'stor-1',
        websocket: WS,
        params: {
            model: 'gridDataModel',
            scope: 'stor-1'   
        },
        reader: {
             type: 'json',
             rootProperty: 'list',
             totalProperty: 'total',
             successProperty: 'success'
        },
        simpleSortMode: true,
        filterParam: 'query',
        remoteFilter: true
    });    
    Ext.define('Book',{
        extend: 'Ext.data.Model',
        fields: [
            'Author',
            'Title',
            'Manufacturer',
            'ProductGroup',
            'DetailPageURL'
        ]
    });
    // create the Data Store
    var store = Ext.create('Ext.data.Store', {
        id: 'stor-1',
        model: 'Book',
        proxy: proxy
    });
    // Создаем gridpanel
    Ext.create('Ext.grid.Panel', {
        title: 'Book List',        
        renderTo: 'binding-example',
        store: store,
        bufferedRenderer: false,
        width: 580,
        height: 400,
        columns: [
            {text: "Author", width: 120, dataIndex: 'Author', sortable: true},
            {text: "Title", flex: 1, dataIndex: 'Title', sortable: true},
            {text: "Manufacturer", width: 125, dataIndex: 'Manufacturer', sortable: true},
            {text: "Product Group", width: 125, dataIndex: 'ProductGroup', sortable: true}
        ],
        forceFit: true,
        height:210,
        split: true,
        region: 'north'
    });
    // загружать данные можно только по готовности соединения.
    // будем проверять сокет каждые 0.1с
    var loadData = function() {
        if(WS.ws.readyState) {
            store.load();
        } else {
            setTimeout(function() {loadData()}, 100)    
        }
    }
    loadData()
});