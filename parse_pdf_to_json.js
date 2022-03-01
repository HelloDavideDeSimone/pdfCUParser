/* Copyright Davide De Simone
*
*     
**/
const fs = require('fs');
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");


const args = process.argv.slice(2);
const PDF_PATH = args[0];
const JSON_FILE = args[1];
const PAGE_NUMBER = parseInt(args[2]);
var textContent = null;

async function loadPDF(){
    console.log(args);
    const loadingTask = pdfjsLib.getDocument({ url: PDF_PATH });
    const pdfDocument = await loadingTask.promise;
    if (PAGE_NUMBER) {
        const page = await pdfDocument.getPage(PAGE_NUMBER);
        textContent = await page.getTextContent();
    }
    
    else {
        for (let pageIndex = 1; pageIndex < pdfDocument.numPages + 1 ; pageIndex++) {
            const page = await pdfDocument.getPage(pageIndex);
            textContent = await page.getTextContent();
        }
    }
    return textContent;
}


async function writePdfToFile() {
    console.log(["e", "r"]);
    let data = JSON.stringify(textContent);
    return fs.writeFileSync(JSON_FILE, data);
}

(async () => {
    await loadPDF();
})();






