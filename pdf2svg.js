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

const PDF_PATH = "./correzione.PDF";
const PAGE_NUMBER = 2;
const PAGE_SCALE = 1.5;
const SVG_NS = "http://www.w3.org/2000/svg";

const DATA_POSITIONS = [
  {"fiscalCode": [[7.2, 262.21, 701.68]]},
  {"firstName": [[10, 334.41, 773.58]]},
  {'lastName': [[10, 132.61, 773.78]]},
  {'emissionDate': [
    [7.2, 43.33, 677.58],
    [7.2, 39.01, 677.58]
]},
  {'vacationRemainingHoursAP': [[7.2, 62.05, 220.68]]},
  {'vacationRemainingHoursAC': [
    [7.2, 253.57, 533.28],
    [7.2, 162.85, 208.68]
  ]},
  {'permissionsRemainingHoursAP': [[7.2, 422.05, 220.68]]},
  {'permissionsRemainingHoursAC': [
    [7.2, 426.37, 208.68],
    [7.2, 527.17, 208.68]
  ]},
  {'payPeriod': [[7.2, 103.81, 677.58]]},
  {'grossAmount': [[7.2,157.09, 653.58]]},
  {'netAmount': [[10, 498.61, 256.78]]},
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

async function pageLoaded() {
  // Loading document and page text content
  const loadingTask = pdfjsLib.getDocument({ url: PDF_PATH });
  const pdfDocument = await loadingTask.promise;
  const page = await pdfDocument.getPage(PAGE_NUMBER);
  const viewport = page.getViewport({ scale: PAGE_SCALE });
  const textContent = await page.getTextContent();
  // building SVG and adding that to the DOM
  const svg = buildSVG(viewport, textContent);
  //console.log(textContent);

function hasSubArray(master, subArray) {
  return subArray.some(sub => sub.every((i => v => i = master.indexOf(v, i) + 1)(0)))
  
 // processing.every((i => v => i = master.indexOf(v, i) + 1)(0));
}

const pdfData = [[]];

textContent.items.forEach( element => {
  DATA_POSITIONS.forEach( (data) => {
    //console.log(Object.keys(data), Object.values(data));
    if(hasSubArray(element.transform, Object.values(data)[0])) {
      pdfData[0][Object.keys(data)] = element.str
    }
  })
});

console.log(pdfData[0])
console.log(textContent);

  document.getElementById("pageContainer").appendChild(svg);
  // Release page resources.
  page.cleanup();
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof pdfjsLib === "undefined") {
    // eslint-disable-next-line no-alert
    alert("Please build the pdfjs-dist library using\n  `gulp dist-install`");
    return;
  }
  pageLoaded();
});
