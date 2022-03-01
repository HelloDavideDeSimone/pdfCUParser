/* Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const PDF_PATH = "./MTS/CU2022rif2021.pdf";
const PAGE_NUMBER = 0;
const PAGE_SCALE = 1.5;
const SVG_NS = "http://www.w3.org/2000/svg";
var lastPage = null;
const DATA_POSITIONS = [
    {"firstName": [[10, 434.99999999999994, 641.1999999999999]]},
    {'lastName': [[10,240.59999999999997,641.1999999999999]]},
    {'positinCertificazione': [[10, 186.67999999999995, 795.3000000000001]]},
    {'fiscalCode': [[10, 96.59999999999997, 641.1999999999999]]}
  ]
  
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "../../node_modules/pdfjs-dist/build/pdf.worker.js";

function buildSVG(viewport, textContent) {
  // Building SVG with size of the viewport (for simplicity)
  const svg = document.createElementNS(SVG_NS, "svg:svg");
  svg.setAttribute("width", viewport.width + "px");
  svg.setAttribute("height", viewport.height + "px");
  // items are transformed to have 1px font size
  svg.setAttribute("font-size", 1);

  // processing all items
  textContent.items.forEach(function (textItem) {
    // we have to take in account viewport transform, which includes scale,
    // rotation and Y-axis flip, and not forgetting to flip text.
    const tx = pdfjsLib.Util.transform(
      pdfjsLib.Util.transform(viewport.transform, textItem.transform),
      [1, 0, 0, -1, 0, 0]
    );
    const style = textContent.styles[textItem.fontName];
    // adding text element
    const text = document.createElementNS(SVG_NS, "svg:text");
    text.setAttribute("transform", "matrix(" + tx.join(" ") + ")");
    text.setAttribute("font-family", style.fontFamily);
    text.textContent = textItem.str;
    svg.appendChild(text);
  });
  return svg;
}


function hasSubArray(master, subArray) {
    return subArray.some(sub => sub.every((i => v => i = master.indexOf(v, i) + 1)(0)))
  }


async function pageLoaded() {
    const loadingTask = pdfjsLib.getDocument({ url: PDF_PATH });
    const pdfDocument = await loadingTask.promise;

    const pdfData = [];
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
        if(i == pdfData.length - 1) {
            pdfData[i].endPage = lastPage - 1;
            console.log("page to export:",pdfData);
            return;
        }
        pdfData[i].endPage = pdfData[i+1].startPage - 1;
    }
}


document.addEventListener("DOMContentLoaded", function () {
  if (typeof pdfjsLib === "undefined") {
    // eslint-disable-next-line no-alert
    alert("Please build the pdfjs-dist library using\n  `gulp dist-install`");
    return;
  }
  pageLoaded();
});
