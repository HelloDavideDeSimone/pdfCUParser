const fs = require('fs');
const PDFDocument = require('pdf-lib').PDFDocument;
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const stringify = require('csv-stringify');

const PDF_PATH = "./example_data/MTS/CU2022rif2021.pdf";
const PAGE_NUMBER = 0;
const PAGE_SCALE = 1.5;
const SVG_NS = "http://www.w3.org/2000/svg";
var lastPage = null;
var pdfData = [];
var namesInPdf = [];
const fileNamePrefix = "CU2022";

const DATA_POSITIONS = [
    {"firstName": [[10, 434.99999999999994, 641.1999999999999]]},
    {'lastName': [[10,240.59999999999997,641.1999999999999]]},
    {'positinCertificazione': [[10, 186.67999999999995, 795.3000000000001]]},
    {'fiscalCode': [[10, 96.59999999999997, 641.1999999999999]]}
  ]
  
function hasSubArray(master, subArray) {
    return subArray.some(sub => sub.every((i => v => i = master.indexOf(v, i) + 1)(0)))
  }

async function pageLoaded() {
    const loadingTask = pdfjsLib.getDocument({ url: PDF_PATH });
    const pdfDocument = await loadingTask.promise;

    lastPage = pdfDocument.numPages + 1;
    for (let pageIndex = 1; pageIndex < pdfDocument.numPages + 1; pageIndex++) {
        const page = await pdfDocument.getPage(pageIndex);
        const viewport = page.getViewport({ scale: PAGE_SCALE });
        const textContent = await page.getTextContent();
        //const svg = buildSVG(viewport, textContent);

        const tempObj = {}
        textContent.items.forEach( element => {
            DATA_POSITIONS.forEach( (data) => {
                if(hasSubArray(element.transform, Object.values(data)[0])) {
                    const key = Object.keys(data)[0];
                    const value = element.str
                    tempObj[key] = value;
                    tempObj.startPage = pageIndex;
                }
            })
        });

            if( !(tempObj
                && Object.keys(tempObj).length === 0
                && Object.getPrototypeOf(tempObj) === Object.prototype)) 
                {
                    pdfData.push(tempObj);
                }

        //document.getElementById("pageContainer").appendChild(svg);
        //page.cleanup();
    }
    
    for(i=0; i < lastPage ; i++) {
        const temp = {nome: pdfData[i].firstName, cognome: pdfData[i].lastName};
        namesInPdf.push(temp);

        if(i == pdfData.length - 1) {
            pdfData[i].endPage = lastPage - 1;
            //console.log("page to export:",pdfData);
            console.log('sucessfully Exported!');

            console.log(namesInPdf)
            splitPdf();
            return;
        }
        pdfData[i].endPage = pdfData[i+1].startPage - 1;
    }
}

function range(start, end) {
    var foo = [];
    for (var i = start; i <= end; i++) {
        foo.push(i);
    }
    return foo;
}

async function splitPdf() {
    console.log('Generating PDFs...');
    const docmentAsBytes = await fs.promises.readFile(PDF_PATH);

    // Load your PDFDocument
    const pdfDoc = await PDFDocument.load(docmentAsBytes)

    for (let index = 0; index < pdfData.length; index++) {
        const pagesToSplit = range(pdfData[index].startPage - 1, pdfData[index].endPage - 1);
        const subDocument = await PDFDocument.create();
        const copiedPages = await subDocument.copyPages(pdfDoc, [...pagesToSplit]);
 
        for (let j = 0; j < copiedPages.length; j++) {
            subDocument.addPage(copiedPages[j]);
        }
        const pdfBytes = await subDocument.save();
        const fileName = `${fileNamePrefix}_${pdfData[index].firstName}_${pdfData[index].lastName}_${pdfData[index].startPage}`;
        await writePdfBytesToFile(`./exported_data/exportedMTS/${fileName}.pdf`, pdfBytes);
    }

    console.log('--END--');
}

async function writePdfBytesToFile(fileName, pdfBytes) {
    return fs.promises.writeFile(fileName, pdfBytes);
}

(async () => {
    await pageLoaded();
})();