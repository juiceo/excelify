    var json2xls = require('../lib/json2xls');
    var fs = require('fs');

    var json = {
        foo: 'bar',
        qux: 'moo',
        poo: 123,
        stux: new Date()
    }

    var xls = json2xls(json,{
        fields: {'poo':'string'}
    });

    fs.writeFileSync('output.xlsx', xls, 'binary');
