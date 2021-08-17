const puppeteer = require('puppeteer');
const fs = require('fs')
const exportSheet = require('./exportSheet')

// day string
var dateObj = new Date();
var year = dateObj.getFullYear();
var month = String(dateObj.getMonth() + 1).padStart(2, '0');;
var day = String(dateObj.getDate()).padStart(2, '0');
var today = year + '-' + month + '-' + day;

const convertTime12to24 = (time12h) => {
    const [time, modifier] = time12h.split(' ');
  
    let [hours, minutes] = time.split(':');
  
    if (hours === '12') {
      hours = '00';
    }
  
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
  
    return `${hours}:${minutes}`;
}
  
const scrapeData = async (urls = null) => {
    for ( const [site_name, url] of Object.entries( urls )) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url + '&date=' + today, {waitUntil: 'load', timeout: 0});
    
        await page.waitForSelector('.jss73');
    
        data = await page.$$eval('.jss73', item => {
            item = item.map(el => {
                let spots_string = el.querySelector('div > div + div > div + div > div > p').textContent;
                let spots = spots_string.split(' ');
                spots = spots[ spots.length - 1 ];
    
                return [
                    el.querySelector('div > div > p').textContent, 
                    el.querySelector('div > div + div > div > div > span > p').textContent,
                    spots
                ];
            });
                
            return item;
        });

        console.log(data[0][0])
        
        var unix_timestamp = (new Date(today + ' ' + convertTime12to24( '00:29 AM' )).getTime() / 1000 );
        var currentDT = new Date();
        var sleep_seconds = (unix_timestamp - currentDT.getTime() / 1000) - 600;

        if( sleep_seconds > 0 ) { // set delay to be run in 10 mins from first ticket time
            setTimeout(() => {
                scrapeData( { [site_name]: url })
            }, parseInt(sleep_seconds) * 1000);
        } else {
            exportSheet.writeScrapeData(site_name, today, data)
        }

        await browser.close();
    }
}

// read urls
var urls = fs.readFileSync('./urls.json');
scrapeData( JSON.parse(urls) );