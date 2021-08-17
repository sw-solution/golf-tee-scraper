const fs = require('fs');
const readline = require('readline');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const credentials = require('./credentials.json'); // the file saved above
const doc = new GoogleSpreadsheet('1xZcKzMWimRmUe9TNXJ7mYbwChmftZqdS09nTpzeI65k');

const writeScrapeData = async (sheet_name, date, data) => {
    await doc.useServiceAccountAuth(credentials);
    
    await doc.loadInfo();
    
    var sheet = doc.sheetsByTitle[sheet_name]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    if( sheet === undefined ) {
        sheet = await doc.addSheet({ title: sheet_name, headerValues: ['Date', 'Time', 'Available Spots', 'Price'] });
    }

    data.forEach(item => {
        item.unshift(date); // insert date field
    });
    
    await sheet.addRows(data, { raw: true } );
    await sheet.addRow(['####################', '####################', '####################'], { raw: true } );
}

exports.writeScrapeData = writeScrapeData;