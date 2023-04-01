// We import the CSS which is extracted to its own file by esbuild.
// Remove this line if you add a your own CSS build pipeline (e.g postcss).
import "../css/app.css"

// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "./vendor/some-package.js"
//
// Alternatively, you can `npm install some-package` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html"
// Establish Phoenix Socket and LiveView configuration.
import {Socket} from "phoenix"
import {LiveSocket} from "phoenix_live_view"
import topbar from "../vendor/topbar"
import { fabric } from "fabric"
import jQuery from 'jquery'
import $ from 'jquery'


let phx_hooks = {}

phx_hooks.Fabric = {

  	mounted() {
	    const { PDFDocument } = PDFLib;

	    // Create global vars
	    var __CANVAS = document.getElementById('pdf-canvas'),
	        __CANVAS_CTX = __CANVAS.getContext('2d'),
	        __PDF_DOC,
	        __CURRENT_PAGE,
	        __TOTAL_PAGES,
	        __FILE_HANDLE,
	        __PAGE_RENDERING_IN_PROGRESS = 0,
	        __EXISTING_PDF_BYTES,
	        __VIEWPORT,
	        __OPEN_PANEL = "",
	        __DRAW_MODE = false,
	        __FABRIC_CANVAS = new fabric.Canvas('fabricCanvas', {
	            selectionLineWidth: 2,
	            width: $("#canvasContainer").width(),
	            height: $("#canvasContainer").height(),
	            uniformScaling: true,
	            uniScaleKey: 'none',
	            renderOnAddRemove: false,
	            allowTouchScrolling: true,
	            backgroundColor: 'white'        
	        }),
	        __FABRIC_CANVAS_DATA = [],
	        __FABRIC_CANVAS_PAGE_DATA = {},
	        __MENU_OPEN = false,
	        curDrawWidth = 20,
	        curDrawColor = "#00AACC",
	        curDrawId = "df-23";
	        // end of global vars

	    const drawColors = [
	        ["#000000", "#58595B", "#808285", "#a7a9ac", "#d1d3d4"],
	        ["#FFFFFF", "#B31564", "#E61B1B", "#FF5500", "#FFAA00"],
	        ["#FFCE00", "#FFE600", "#A2E61B", "#26E600", "#008055"],
	        ["#00AACC", "#004DE6", "#3D00B8", "#6600CC", "#600080"],
	        ["#F7D7C4", "#BB9167", "#8E562E", "#613D30", "#FF80FF"],
	        ["#FFC680", "#FFFF80", "#80FF9E", "#80D6FF", "#BCB3FF"]
	    ];

	    // register Fabric event handlers with key/value pairs
	    __FABRIC_CANVAS.on({
	        'object:moving' : moveHandler,
	    });

	    // Do some initializing stuff via prototype
	    fabric.Object.prototype.set({
	        transparentCorners: false,
	        cornerColor: 'rgba(40,113,100,0.5)',
	        cornerSize: 12,
	        cornerStyle: 'circle',
	        padding: 0,
	        lockScalingFlip: true
	    });

	    fabric.ActiveSelection.prototype.set({
	        centeredScaling: true,
	        subTargetCheck: true
	    });

	    // Customize Fabric object attributes
	    // Add attributes to support use of image object as video object
	    // and to allow Rito rendering of objects
	    fabric.Object.prototype.toObject = (function (toObject) {
	        return function (propertiesToInclude) {
	            propertiesToInclude = (propertiesToInclude || []).concat(
	                [
	                    'your_custom_type'
	                ]
	            );
	            return toObject.apply(this, [propertiesToInclude]);
	        };
	    })(fabric.Object.prototype.toObject);

	    fabric.ActiveSelection.prototype.setControlsVisibility({
	        mt: false, // middle top 
	        mb: false, // midle bottom
	        ml: false, // middle left
	        mr: false, // middle right
	        tl: false, //top left
	        tr: false, //top right
	        bl: false, //bottom left
	        br: false, //bottom right
	        mtr: false, //rotation
	        delete: true,
	        edit: false,
	        correct: false,
	        add: false,
	        remove: false,
	        font: false,
	        assign: false,
	        preview: false
	    });

	    // create 2 page blank PDF as default
	    createDefaultPDF();

	    document.getElementById("drawWidth").addEventListener('change', drawWidth);

	    addButtonListeners();

	    createDrawPath();
	    createDrawPalette();

	    document.querySelectorAll('circle').forEach(function(item) {
	        if (item.id.substring(1,2) == 'f') {  // apply only to front circles
	            item.addEventListener('click', function(event) {
	                var circleF = event.target;
	                var id = event.target.id;
	                var type = id.substring(0,1);  // h or d
	                var index = id.substring(3);
	                var backId = type + 'b-' + index;
	                var circleB = document.getElementById(backId);
					if (type == "d" && id != curDrawId) {  // draw
	                    circleF.setAttributeNS(null, "stroke", "white");
	                    circleB.setAttributeNS(null, "r", 15);
	                    circleB.setAttributeNS(null, "stroke-width", 2);
	                    circleB.setAttributeNS(null, "stroke", "#0078D4");
	                    circleB.setAttributeNS(null, "fill", "white");
	                    var svgObj = document.getElementById("drawSVG");
	                    var row = index.substring(0,1);
	                    var col = index.substring(1,2);
	                    svgObj.setAttributeNS(null, "stroke", drawColors[row][col]);
	                    // normalize previous selection object
	                    normalizeColor(curDrawId);
	                    // save current color selection
	                    curDrawId = circleF.id;
	                    curDrawColor = drawColors[row][col];
	                    __FABRIC_CANVAS.freeDrawingBrush.color = curDrawColor;
	                    var activeObject = __FABRIC_CANVAS.getActiveObjects()[0];
	                    if (activeObject && activeObject.your_custom_type == 'draw') {
	                        activeObject.set('stroke', curDrawColor);
	                        __FABRIC_CANVAS.requestRenderAll();
	                    }                  
	                }
	            });
	            item.addEventListener('mouseover', function(event){
	                var circleF = event.target;
	                var id = event.target.id;
	                var type = id.substring(0,1);  // h or d
	                var index = id.substring(3);
	                var backId = type + 'b-' + index;
	                var circleB = document.getElementById(backId);
	                if ((type == "h" && id != curHighlightId) || (type == "d" && id != curDrawId || (type == "f" && id != curFillId || (type == "b" && id != curBorderId))))  {
	                    circleB.setAttributeNS(null, "fill", "white");
	                }
	            });
	            item.addEventListener('mouseout', function(event){
	                var circleF = event.target;
	                var id = event.target.id;
	                var type = id.substring(0,1);  // h or d
	                var index = id.substring(3);
	                var backId = type + 'b-' + index;
	                var circleB = document.getElementById(backId);
	                if (type == "h" && id != curHighlightId) {
	                    var i = parseInt(index);
	                    circleB.setAttributeNS(null, "fill", highlightColors[i]);
	                } else if (type == "d" && id != curDrawId || type == "f" && id != curFillId || type == "b" && id != curBorderId) {
	                    var row = index.substring(0,1);
	                    var col = index.substring(1,2);
	                    circleB.setAttributeNS(null, "fill", drawColors[row][col]);
	                }
	            });                
	        }
	    });

		function addButtonListeners() {
	      var uploadButton = document.getElementById("upload-pdf");
	      uploadButton.addEventListener(
	        "mousedown",
	        (event) => {
	          uploadPdf();
	        },
	        false
	      );        
	      var drawButton = document.getElementById("draw-mode");
	      drawButton.addEventListener(
	        "mousedown",
	        (event) => {
	          if (__DRAW_MODE) {
	              __DRAW_MODE = false;
	              defaultMode();
	          } else {
	              draw();
	          }
	        },
	        false
	      );        
		}

	    function uploadPdf() {
	        __FABRIC_CANVAS.isDrawingMode = false;
	    	var drawButton = document.getElementById('draw-mode');
	    	drawButton.classList.remove("active_button");
	        __DRAW_MODE = false;
	        $("#file-to-upload").trigger('click');
	    }

	    function defaultMode() {
	    	var drawButton = document.getElementById('draw-mode');
	    	drawButton.classList.remove("active_button");
	        fabric.ActiveSelection.prototype.setControlsVisibility({
	            delete: true
	        });
	        __FABRIC_CANVAS.isDrawingMode = false;
	        __DRAW_MODE = false;
		    __FABRIC_CANVAS.requestRenderAll();	
	    }

	    // When user chooses a PDF file
	    $("#file-to-upload").on('change', function() {
	        // Validate whether PDF
	        if (['application/pdf'].indexOf($("#file-to-upload").get(0).files[0].type) == -1) {
	            alert('Error : Not a PDF');
	            return;
	        }
	        __FABRIC_CANVAS.isDrawingMode = false;
	        $("#upload-button").hide();
	        // Send the object url of the pdf
	        showSelectedPDF(URL.createObjectURL($("#file-to-upload").get(0).files[0]));
	        this.value = null;
	    });

	    function showSelectedPDF(pdf_url) {
	        $("#pdf-loader").show();
	        pdfjsLib.getDocument({ url: pdf_url }).promise.then(function(pdf_doc) {
	            __PDF_DOC = pdf_doc;
	            __TOTAL_PAGES = __PDF_DOC.numPages;
	            __PDF_DOC.getData().then(function(pdf_data) {
	                __EXISTING_PDF_BYTES = pdf_data;
	            });
	            // Hide the pdf loader and show pdf container in HTML
	            $("#pdf-loader").hide();
	            $("#pdf-total-pages").text(__TOTAL_PAGES);
	            // reset file input to allow same url to be uploaded
	            $("#file-to-upload").val('');
	            // Show the first page
	            showPage(1);
	        }).catch(function(error) {
	            $("#pdf-loader").hide();            
	            alert(error.message);
	        });
	    }

	    function createDrawPath() {
	        drawBezier("#FF0000", curDrawWidth, "draw");
	    }

	    function drawBezier(stroke, width, type) {
	        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	        var pathData = "";
	        path.setAttributeNS(null, "fill", "transparent");
	        if (type == "draw") {
	            pathData = "M33,284 C82,251 134,309 187,281";
	            path.setAttributeNS(null, "stroke", stroke);
	            path.setAttributeNS(null, "stroke-linecap", "round");  // draw mode
	            path.setAttributeNS(null, "id", "drawSVG");
	            path.setAttributeNS(null, "d", pathData);
	            path.setAttributeNS(null, "stroke-width", width + "px");
	            document.getElementById("drawCanvas").appendChild(path);
	        }
	    }

	    function createDrawPalette() {
	        for (var i = 0; i < 6; i++) {  // row
	            for (var j = 0; j < 5; j++) {  // column
	                var circleB = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	                circleB.setAttributeNS(null, "cx", 30 + j*40);
	                circleB.setAttributeNS(null, "cy", 25 + i*40);
	                circleB.setAttributeNS(null, "r", 15);
	                circleB.setAttributeNS(null, "stroke", "black");
	                circleB.setAttributeNS(null, "stroke-width", 1);
	                circleB.setAttributeNS(null, "fill", drawColors[i][j]);
	                circleB.setAttributeNS(null, "id", "db-" + i.toString() + j.toString());
	                document.getElementById("drawCanvas").appendChild(circleB);
	                var circleF = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	                circleF.setAttributeNS(null, "cx", 30 + j*40);
	                circleF.setAttributeNS(null, "cy", 25 + i*40);
	                circleF.setAttributeNS(null, "r", 12);
	                circleF.setAttributeNS(null, "stroke", drawColors[i][j]);
	                circleF.setAttributeNS(null, "stroke-width", 2);
	                circleF.setAttributeNS(null, "fill", drawColors[i][j]);
	                circleF.setAttributeNS(null, "id", "df-" + i.toString() + j.toString());
	                document.getElementById("drawCanvas").appendChild(circleF);
	                if (circleF.id == curDrawId) {
	                    circleF.setAttributeNS(null, "stroke", "white");
	                    circleB.setAttributeNS(null, "stroke-width", 2);
	                    circleB.setAttributeNS(null, "stroke", "#1a49e1");
	                    circleB.setAttributeNS(null, "fill", "white");
	                    var svgObj = document.getElementById("drawSVG");
	                    svgObj.setAttributeNS(null, "stroke", drawColors[i][j]);
	                    curDrawColor = drawColors[i][j];
	                };
	            };
	        };
	    }

	    function normalizeColor(id) {
	        var circleF = document.getElementById(id);
	        var type = id.substring(0,1);  // h or d
	        var index = id.substring(3);
	        var backId = type + 'b-' + index;
	        var circleB = document.getElementById(backId);
	        circleB.setAttributeNS(null, "stroke", "black");
	        circleB.setAttributeNS(null, "stroke-width", 1);
	        if (type == "h") {
	            var i = parseInt(index);
	            circleF.setAttributeNS(null, "stroke", highlightColors[i]);
	            circleB.setAttributeNS(null, "fill", highlightColors[i]);
	        } else {
	            var row = index.substring(0,1);
	            var col = index.substring(1,2);
	            circleF.setAttributeNS(null, "stroke", drawColors[row][col]);
	            circleB.setAttributeNS(null, "fill", drawColors[row][col]);
	        };
	    }

	    function drawWidth(){  // called by click event listener
	        var drawSVG = document.getElementById("drawSVG");
	        drawSVG.setAttribute("stroke-width", parseInt(this.value) + "px");
	        curDrawWidth = parseInt(this.value);
	        console.log("Draw width: " + curDrawWidth);
	        __FABRIC_CANVAS.freeDrawingBrush.width = curDrawWidth;
	        var activeObject = __FABRIC_CANVAS.getActiveObjects()[0];
	        if (activeObject && activeObject.rito_type == 'draw') {
	            activeObject.set('strokeWidth', curDrawWidth);
	            __FABRIC_CANVAS.requestRenderAll();
	        };    
	        __FABRIC_CANVAS.requestRenderAll();
	    }

	    function draw() {
	    	var drawButton = document.getElementById('draw-mode');
	    	drawButton.classList.add("active_button");
	        __DRAW_MODE = true;
	        __FABRIC_CANVAS.defaultCursor = 'default';
	        __FABRIC_CANVAS.moveCursor = 'move';
	        __FABRIC_CANVAS.discardActiveObject().renderAll();
	        __FABRIC_CANVAS.selection = false;
	        __FABRIC_CANVAS.freeDrawingBrush = new fabric.PencilBrush(__FABRIC_CANVAS);
	        __FABRIC_CANVAS.freeDrawingBrush.color = curDrawColor;
	        __FABRIC_CANVAS.freeDrawingBrush.width = curDrawWidth;
	        __FABRIC_CANVAS.freeDrawingBrush.straightLineKey = 'shiftKey';
	        __FABRIC_CANVAS.freeDrawingBrush.strokeLineCap = 'round';
	        __FABRIC_CANVAS.freeDrawingBrush.limitedToCanvasSize = true;
	        __FABRIC_CANVAS.isDrawingMode = true;
	    }

	    function moveHandler(ev) {  // called by movehandler listener
	        // Handle the object moving event here
	        console.log ("Fabric object move event");
	    }

	    function keyHandler(e) {  // called by windows keydown listener
	        // default mode
	        if (e.key == 'ArrowDown' && e.shiftKey) {
	            var selection = __FABRIC_CANVAS.getActiveObject();
	            if (selection != undefined) {
	                var top = selection.top;
	                selection.set('top', top + 5);
	                if (selection.rito_type == 'receptacle_image_matching' ||
	                    selection.rito_type == 'answer_image_matching') {
	                    adjustImageMatchLines(selection);
	                }
	                e.preventDefault();
	            }
	        } else if (e.key == 'ArrowUp' && e.shiftKey) {
	            var selection = __FABRIC_CANVAS.getActiveObject();
	            if (selection != undefined) {
	                var top = selection.top;
	                selection.set('top', top - 5);
	                if (selection.rito_type == 'receptacle_image_matching' ||
	                    selection.rito_type == 'answer_image_matching') {
	                    adjustImageMatchLines(selection);
	                }
	                e.preventDefault();
	            }        
	        } else if (e.key == 'ArrowLeft' && e.shiftKey) {
	            var selection = __FABRIC_CANVAS.getActiveObject();
	            if (selection != undefined) {
	                var left = selection.left;
	                selection.set('left', left - 5);
	                if (selection.rito_type == 'receptacle_image_matching' ||
	                    selection.rito_type == 'answer_image_matching') {
	                    adjustImageMatchLines(selection);
	                }
	                e.preventDefault();
	            }        
	        } else if (e.key == 'ArrowRight' && e.shiftKey) {
	            var selection = __FABRIC_CANVAS.getActiveObject();
	            if (selection != undefined) {
	                var left = selection.left;
	                selection.set('left', left + 5);
	                if (selection.rito_type == 'receptacle_image_matching' ||
	                    selection.rito_type == 'answer_image_matching') {
	                    adjustImageMatchLines(selection);
	                }
	                e.preventDefault();
	            }        
	        } else if (e.key == 'ArrowDown') {
	            var selection = __FABRIC_CANVAS.getActiveObject();
	            if (selection != undefined) {
	                var top = selection.top;
	                selection.set('top', top + 1);
	                if (selection.rito_type == 'receptacle_image_matching' ||
	                    selection.rito_type == 'answer_image_matching') {
	                    adjustImageMatchLines(selection);
	                }
	                e.preventDefault();
	            }
	        } else if (e.key == 'ArrowUp') {
	            var selection = __FABRIC_CANVAS.getActiveObject();
	            if (selection != undefined) {
	                var top = selection.top;
	                selection.set('top', top - 1);
	                if (selection.rito_type == 'receptacle_image_matching' ||
	                    selection.rito_type == 'answer_image_matching') {
	                    adjustImageMatchLines(selection);
	                }
	                e.preventDefault();
	            }        
	        } else if (e.key == 'ArrowLeft') {
	            var selection = __FABRIC_CANVAS.getActiveObject();
	            if (selection != undefined) {
	                var left = selection.left;
	                selection.set('left', left - 1);
	                if (selection.rito_type == 'receptacle_image_matching' ||
	                    selection.rito_type == 'answer_image_matching') {
	                    adjustImageMatchLines(selection);
	                }
	                e.preventDefault();
	            }        
	        } else if (e.key == 'ArrowRight') {
	            var selection = __FABRIC_CANVAS.getActiveObject();
	            if (selection != undefined) {
	                var left = selection.left;
	                selection.set('left', left + 1);
	                if (selection.rito_type == 'receptacle_image_matching' ||
	                    selection.rito_type == 'answer_image_matching') {
	                    adjustImageMatchLines(selection);
	                }
	                e.preventDefault();
	            }        
	        }
	        if (
	            e.keyCode == 46 ||
	            e.key == 'Delete' ||
	            e.code == 'Delete'
	        ) {
		        var activeSelection = __FABRIC_CANVAS.getActiveObject();
                if (activeSelection._objects != null) {
                    var activeObject = __FABRIC_CANVAS.getActiveObjects();
                    __FABRIC_CANVAS.remove(...activeObject);
                } else {
					__FABRIC_CANVAS.remove(activeSelection);
                }
	        }
	        __FABRIC_CANVAS.requestRenderAll();
	        return false;       
	    }

	    let resizeCanvas = function () {  // called by window resize event listener
		    var con = document.getElementById("pdf-main-container"),
		          aspect = __FABRIC_CANVAS.height/__FABRIC_CANVAS.width,    
		          width = con.offsetWidth,
		          height = con.offsetHeight,
		          adj_height = Math.round(width * aspect);
		    __FABRIC_CANVAS.setWidth(width);
		    __FABRIC_CANVAS.setHeight(adj_height);
		    // Get canvas position
		    var pdfCanvasEl = document.getElementById("pdf-canvas");
		    var pdfCanvasElPos = pdfCanvasEl.getBoundingClientRect();
		    var canvasContainer = document.getElementById('canvasContainer');
		    var textLayer = document.getElementById('text-layer');
		    var annotationLayer = document.getElementById('annotation-layer');
		    textLayer.style.top = pdfCanvasElPos.top + 'px';
		    annotationLayer.style.top = pdfCanvasElPos.top + 'px';
		    canvasContainer.style.top = pdfCanvasElPos.top + 'px';
		    textLayer.style.height = __CANVAS.height + 'px';
		    annotationLayer.style.height = __CANVAS.height + 'px';
		    canvasContainer.style.height = __CANVAS.height + 'px';
		    textLayer.style.width = __CANVAS.width + 'px';
		    annotationLayer.style.width = __CANVAS.width + 'px';
		    canvasContainer.style.width = __CANVAS.width + 'px';
		    textLayer.style.left = pdfCanvasElPos.left + 'px';
	        annotationLayer.style.left = pdfCanvasElPos.left + 'px';
	        canvasContainer.style.left = pdfCanvasElPos.left + 'px';
	    }

	    async function createDefaultPDF() {
	        localStorage.clear();
	        __FABRIC_CANVAS_DATA = [];
	        $("#pdf-loader").show();
	        const pdf_doc = await PDFDocument.create();
	        pdf_doc.insertPage(0);  // 0 based, e.g. 1 inserts at 2nd pg loc
	        pdf_doc.insertPage(1);
	        __PDF_DOC = pdf_doc;
	        __TOTAL_PAGES = 2;
	        __EXISTING_PDF_BYTES = await pdf_doc.save();        
	        var textLayer = document.getElementById("text-layer");
	        textLayer.style["z-index"] = -1;    
	        var canvas_offset = $("#pdf-canvas").offset();
	        $("#text-layer").css({ left: canvas_offset.left + 'px', top: canvas_offset.top + 'px', height: __CANVAS.height + 'px', width: __CANVAS.width + 'px' });
	        // Assign the CSS created to the annotation-layer element
	        $("#annotation-layer").css({ left: canvas_offset.left + 'px', top: canvas_offset.top + 'px', height: __CANVAS.height + 'px', width: __CANVAS.width + 'px' });
	        showUpdatedPDF(1);
	    }

	    function showUpdatedPDF(pagenumber) {
	        pdfjsLib.getDocument({ data: __EXISTING_PDF_BYTES }).promise.then(function(pdf_doc) {
	            __PDF_DOC = pdf_doc;
	            __TOTAL_PAGES = __PDF_DOC.numPages;
	            // Hide the pdf loader and show pdf container in HTML
	            $("#pdf-loader").hide();
	            $("#pdf-total-pages").text(__TOTAL_PAGES);

	            // Show the defined page
	            if (pagenumber > __TOTAL_PAGES) {
	                pagenumber = pagenumber - 1;
	            }
	            showPage(pagenumber);
	        }).catch(function(error) {
	            // If error re-show the upload button
	            $("#pdf-loader").hide();            
	            alert(error.message);
	        });
	    }

	    function showPage(page_no) {
	        __PAGE_RENDERING_IN_PROGRESS = 1;
	        __CURRENT_PAGE = page_no;
	        __NEXT_S_POS = 40;
	        __NEXT_R_POS = 40;
	        __FABRIC_CANVAS_PAGE_DATA = {
	            objects: []
	        };  

	        // While page is being rendered hide the canvas & annotation layer and show a loading message
	        $("#pdf-canvas").hide();
	        $("#annotation-layer").hide();
	        $("#text-layer").hide();
	        $("#canvasContainer").hide();
	        $("#page-loader").show();

	        // Update current page in HTML
	        let currentPageDiv = document.getElementById('pdf-current-page');
	        currentPageDiv.innerText = page_no;
	        let totalPagesDiv = document.getElementById('pdf-total-pages');
	        totalPagesDiv.innerText = __TOTAL_PAGES;

	        // Fetch the page
	        __PDF_DOC.getPage(page_no).then(function(page) {
	            // As the canvas is of a fixed width we need to set the scale of the viewport accordingly
	            var scale_required = __CANVAS.width / page.getViewport({ scale: 1 }).width;
	            // Get viewport of the page at required scale
	            var viewport = page.getViewport({ scale: scale_required });
	            __VIEWPORT = viewport;
	            // Set canvas height
	            __CANVAS.height = viewport.height;

	            var renderContext = {
	                canvasContext: __CANVAS_CTX,
	                viewport: viewport
	            };
	            
	            // Render the page contents in the canvas
	            page.render(renderContext).promise.then(function() {
	                __PAGE_RENDERING_IN_PROGRESS = 0;

	                // Re-enable Prev & Next buttons
	                $("#pdf-next, #pdf-prev").removeAttr('disabled');

	                // Show the canvas and hide the page loader
	                $("#pdf-canvas").show();
	                $("#page-loader").hide();

	                return page.getTextContent();
	            }).then(function(textContent) {
	                if (textContent.items.length > 0) {
	                    var textLayer = new pdfjsLib.renderTextLayer({
	                        container: $("#text-layer").get(0),
	                        pageIndex: page.pageIndex,
	                        viewport: viewport,
	                        textContent: textContent
	                    });

	                    // Get canvas position
		                var pdfCanvasEl = document.getElementById("pdf-canvas");
		                var pdfCanvasElPos = pdfCanvasEl.getBoundingClientRect();
	                    // Clear HTML for text layer and show
	                    $("#text-layer").html('').show();

	                    // Assign the CSS created to the text-layer element

	                    $("#text-layer").css({ left: pdfCanvasElPos.left + 'px', top: pdfCanvasElPos.top + 'px', height: __CANVAS.height + 'px', width: __CANVAS.width + 'px' });
	                    // }
	                    $("#header-highlight-text").prop('disabled', false);
	                } else {
	                    $("#header-highlight-text").prop('disabled', true);
	                }
	                // Return annotation data of the page after the pdf has been rendered in the canvas
	                return page.getAnnotations();
	            }).then(function(annotationData) {

	                // Get canvas position
	                var pdfCanvasEl = document.getElementById("pdf-canvas");
	                var pdfCanvasElPos = pdfCanvasEl.getBoundingClientRect();

	                // Clear HTML for annotation layer and show
	                $("#annotation-layer").html('').show();

	                // Assign the CSS created to the annotation-layer element
	                $("#annotation-layer").css({ left: pdfCanvasElPos.left + 'px', top: pdfCanvasElPos.top + 'px', height: __CANVAS.height + 'px', width: __CANVAS.width + 'px' });

	                if (annotationData.length > 0) {
	                    try {
	                        pdfjsLib.AnnotationLayer.render({
	                            viewport: viewport.clone({ dontFlip: true }),
	                            div: $("#annotation-layer").get(0),
	                            annotations: annotationData,
	                            page: page
	                        });
	                    } catch(error) {
	                        console.log("error");
	                    };
	                }

	                // Clear HTML for fabric layer and show
	                $("#canvasContainer").show();
	                $("#canvasContainer").css({ left: pdfCanvasElPos.left + 'px', top: pdfCanvasElPos.top + 'px', height: __CANVAS.height + 'px', width: __CANVAS.width + 'px', position: 'absolute' });

	                __FABRIC_CANVAS.clear();  // clear all objects from previous load
	                __FABRIC_CANVAS.setHeight(__CANVAS.height);
	                __FABRIC_CANVAS.setWidth(__CANVAS.width);
	                var storedAnnotationsData = JSON.parse(localStorage.getItem("fabric_annotations_" + page_no));
	                if (__FABRIC_CANVAS_DATA.length >= page_no) {  // canvas data available for page
	                    var pageData = __FABRIC_CANVAS_DATA[page_no-1];
	                    if (pageData != undefined) {
	                        __FABRIC_CANVAS_PAGE_DATA = __FABRIC_CANVAS_DATA[page_no-1].canvas;
	                    }
	                }
	                if (storedAnnotationsData != null) {
	                    if (storedAnnotationsData.objects.length > __FABRIC_CANVAS_PAGE_DATA.objects.length) {  // localStorage has more data for page than canvas data does
	                        __FABRIC_CANVAS_PAGE_DATA = storedAnnotationsData;  // redefine page data
	                        var page = {
	                            canvas: storedAnnotationsData
	                        };
	                        __FABRIC_CANVAS_DATA[page_no - 1] = page;
	                    }
	                }
	                if (__FABRIC_CANVAS_PAGE_DATA.objects.length > 0) {
	                    __FABRIC_CANVAS.loadFromJSON(__FABRIC_CANVAS_PAGE_DATA, canvasLoaded);
	                }
	            });
	        });
	    }

		window.addEventListener('keydown', keyHandler);
	    window.onresize = resizeCanvas
	}
};

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
let liveSocket = new LiveSocket("/live", Socket, {
	params: {
		_csrf_token: csrfToken
	},
	hooks: phx_hooks
})

// Show progress bar on live navigation and form submits
topbar.config({barColors: {0: "#29d"}, shadowColor: "rgba(0, 0, 0, .3)"})
window.addEventListener("phx:page-loading-start", info => topbar.show())
window.addEventListener("phx:page-loading-stop", info => topbar.hide())

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket
