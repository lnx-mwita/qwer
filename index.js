const puppeteer = require('puppeteer');
const fs = require('fs');




const pdf_handler = async (template,path) => {

  // Create a browser instance
  const browser = await puppeteer.launch();

  // Create a new page
  const page = await browser.newPage();
  try { 
  fs.writeFileSync('index.html', template);  
  } catch (error) { 
    console.log(error)
    return false
  } 
  //Get HTML content from HTML file
  try { 
  const html = fs.readFileSync("index.html", 'utf-8');
  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  // To reflect CSS used for screens instead of print
  await page.emulateMediaType('screen');

  // Downlaod the PDF
  const pdf = await page.pdf({
    path: path,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    printBackground: false,
    format: 'A4',
  });

  // Close the browser instance
  await browser.close();
  return true
}
catch (error) {
    console.log(error)
    return false
}
}

module.exports = {
  pdf_handler
}