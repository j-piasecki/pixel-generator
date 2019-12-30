import { Vector2 } from "../core/vector2.mjs";
import { Layer } from "./layer.mjs";
import { LayerComposer } from "./layerComposer.mjs";
import { LayerPicker } from "./layerPicker.mjs";

export class CanvasManager {
    /**
     * Input and drawing manager for canvas element
     * @param {Canvas} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.layerPicker = new LayerPicker(this);

        this.wireframesVisible = true;

        this.translation = new Vector2(0, 0);
        this.targetTranslation = new Vector2(0, 0);
        this.scale = 1;
        this.targetScale = 1;
        this.scaleFocus = new Vector2(0, 0);
        this.isCenteringContent = false;

        this.mousePointerPosition = new Vector2(0, 0);
        this.mouseDownPosition = new Vector2(0, 0);
        this.mouseDown = false;

        this.pixelSize = 16;
    }

    /**
     * Start drawing loop and register events, create drawing layer
     * @param {Number} width - Width of the layer
     * @param {Number} height - Height of the layer
     */
    init(width, height) {
        this.setup(width, height);
        this.render();

        window.addEventListener("mouseup", (e) => { this.onMouseUp(e); });
        window.addEventListener("mousemove", (e) => { this.onMouseMove(e); });
        this.canvas.addEventListener("mousedown", (e) => { this.onMouseDown(e); });
        this.canvas.addEventListener("wheel", (e) => { this.onMouseWheel(e); });
    }

    /**
     * Create drawing layer
     * @param {Number} width - Width of the layer
     * @param {Number} height - Height of the layer
     */
    setup(width, height) {
        this.drawingLayer = new Layer(width, height);
        this.selectedLayer = this.drawingLayer;
        this.layerComposer = new LayerComposer(this.drawingLayer);
        this.currentLayer = this.layerComposer.nextLayer();
        this.variables = {}; //global variables

        this.centerContent(false);
    }

    /**
     * @returns {Layer} - Returns new layer and puts it on top of the drawing stack
     */
    get nextLayer() {
        this.currentLayer = this.layerComposer.nextLayer();

        return this.currentLayer;
    }

    /**
     * Process animations
     */
    update() {
        if (this.targetScale < 0.025)
            this.targetScale = 0.025;
            
        let scaleChange = (this.scale - this.targetScale) * 0.15;

        if (this.scale != this.targetScale) {
            let preScaleFocus = this.detransformPoint(this.scaleFocus);
            this.scale -= scaleChange;
            let afterScaleFocus = this.detransformPoint(this.scaleFocus);

            if (!this.isCenteringContent) {
                this.translation.x -= preScaleFocus.x - afterScaleFocus.x;
                this.translation.y -= preScaleFocus.y - afterScaleFocus.y;
            }
        }

        if (this.isCenteringContent && (Math.abs(this.translation.x - this.targetTranslation.x) > 0.01 || Math.abs(this.translation.y - this.targetTranslation.y) > 0.01)) {
            this.translation.x -= (this.translation.x - this.targetTranslation.x) * (0.2 + Math.abs(scaleChange));
            this.translation.y -= (this.translation.y - this.targetTranslation.y) * (0.2 + Math.abs(scaleChange));
        } else if (Math.abs(this.scale - this.targetScale) < 0.01) {
            this.isCenteringContent = false;
        }

        this.layerPicker.update();
    }

    /**
     * Drawing method
     */
    render() {
        window.requestAnimationFrame(() => { this.render(); });
        this.update();

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBuffer(this.selectedLayer);
        this.drawImageBounds();

        this.layerPicker.render(this.context);
    }

    /**
     * Draws buffered image to the canvas
     * @param {Layer} layer - Layer to be drawn
     */
    drawBuffer(layer) {
        this.context.imageSmoothingEnabled = false;

        this.context.save();
        this.context.translate(this.translation.x * this.scale, this.translation.y * this.scale);
        this.context.scale(this.pixelSize * this.scale, this.pixelSize * this.scale);
        this.context.drawImage(layer.buffer, 0, 0);
        this.context.restore();

        this.drawWireframes(layer);
    }

    /**
     * Clears drawing layer and all composited layers
     */
    clear() {
        this.drawingLayer.clear();
        this.layerComposer.clear();
        this.variables = {};
    }

    /**
     * Draws content of specified layer directly to the canvas
     * @param {Layer} layer - Layer to be drawn
     */
    drawLayer(layer) {
        let startX = Math.floor(this.translation.x * this.scale);
        let startY = Math.floor(this.translation.y * this.scale);
        let size = this.pixelSize * this.scale

        for (let x = 0; x < layer.width; x++) {
            for (let y = 0; y < layer.height; y++) {
                if (layer.getPixel(x, y).a == 0)
                    continue;

                this.context.fillStyle = layer.getPixel(x, y).getRGBAString();
                this.context.fillRect(startX + size * x, startY + size * y, size + 1, size + 1);
            }
        }

        this.drawWireframes(layer);
    }

    /**
     * Draws wireframes from the layer to the canvas
     * @param {Layer} layer - Source of wireframes
     */
    drawWireframes(layer) {
        if (this.wireframesVisible) {
            for (let i = 0; i < layer.wireframes.length; i++) {
                layer.wireframes[i].draw(this);
            }
        }
    }

    /**
     * Draws white outline around rendered image
     */
    drawImageBounds() {
        let startX = Math.floor(this.translation.x * this.scale);
        let startY = Math.floor(this.translation.y * this.scale);
        let size = this.pixelSize * this.scale

        this.context.strokeStyle = "#fff";
        this.context.strokeRect(startX, startY, size * this.drawingLayer.width, size * this.drawingLayer.height);
    }

    /**
     * Scale image to fit in the canvas and place it in the center
     * @param {Boolean} animate - Animate the process
     */
    centerContent(animate) {
        let scaleX = this.canvas.width * 0.8 / (this.pixelSize * this.drawingLayer.width);
        let scaleY = this.canvas.height * 0.8 / (this.pixelSize * this.drawingLayer.height);
        let newScale = (scaleX < scaleY) ? scaleX : scaleY;

        let translationX = (this.canvas.width - newScale * this.pixelSize * this.drawingLayer.width) * 0.35 / newScale;
        let translationY = (this.canvas.height - newScale * this.pixelSize * this.drawingLayer.height) * 0.5 / newScale;

        if (animate) {
            this.scaleFocus.x = (this.translation.x + this.drawingLayer.width * this.pixelSize * 0.5) * this.scale;
            this.scaleFocus.y = (this.translation.y + this.drawingLayer.height * this.pixelSize * 0.5) * this.scale;
            this.isCenteringContent = true;

            this.targetScale = newScale;
            this.targetTranslation.x = translationX;
            this.targetTranslation.y = translationY;
        } else {
            this.scale = this.targetScale = newScale;
            this.translation.x = this.targetTranslation.x = translationX;
            this.translation.y = this.targetTranslation.y = translationY;
        }
    }

    /**
     * @param {String} name - Name of the accessed variable
     * @returns {Number} - Returns value of specified variable
     */
    getVariable(name) {
        return this.variables[name];
    }

    /**
     * Sets selected varialbe to specified value
     * @param {String} name - Name of the variable
     * @param {Number} value - New value
     */
    setVariable(name, value) {
        this.variables[name] = value;
    }

    /**
     * @param {Vector2} point - Point to be transformed
     * @returns {Vector2} - Return scaled and translated point
     */
    transformPoint(point) {
        return new Vector2((this.translation.x + point.x) * this.scale, (this.translation.y + point.y) * this.scale);
    }

    /**
     * @param {Vector2} point - Point to be detransformed
     * @returns {Vector2} - Returns point before scaling and translation
     */
    detransformPoint(point) {
        return new Vector2(point.x / this.scale - this.translation.x, point.y / this.scale - this.translation.y);
    }

    /**
     * Handling mouse down event
     * @param {MouseEvent} e 
     */
    onMouseDown(e) {
        if (this.layerPicker.onMouseDown()) return;

        this.mouseDown = true;
        let rect = this.canvas.getBoundingClientRect();

        this.mouseDownPosition.x = this.mousePointerPosition.x = e.clientX - rect.left;
        this.mouseDownPosition.y = this.mousePointerPosition.y = e.clientY - rect.top;
    }

    /**
     * Handling mouse move event (change translation)
     * @param {MouseEvent} e 
     */
    onMouseMove(e) {
        let rect = this.canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        if (this.mouseDown) {
            this.translation.x -= (this.mousePointerPosition.x - x) / this.scale;
            this.translation.y -= (this.mousePointerPosition.y - y) / this.scale;

            this.targetTranslation.x = this.translation.x;
            this.targetTranslation.y = this.translation.y;
        }

        this.mousePointerPosition.x = x;
        this.mousePointerPosition.y = y;
    }

    /**
     * Handling mouse up event
     * @param {MouseEvent} e 
     */
    onMouseUp(e) {
        this.mouseDown = false;
    }

    /**
     * Handling mouse wheel event (change translation and scale)
     * @param {MouseEvent} e 
     */
    onMouseWheel(e) {
        if (this.layerPicker.onScroll(e)) return;

        if (e.ctrlKey) {
            this.targetScale *= 1 + e.deltaY * 0.01;

            this.scaleFocus.x = this.mousePointerPosition.x;
            this.scaleFocus.y = this.mousePointerPosition.y;
        } else if (e.shiftKey) {
            this.translation.x -= (-e.deltaY) / this.scale;
            this.translation.y -= (-e.deltaX) / this.scale;

            this.targetTranslation.x = this.translation.x;
            this.targetTranslation.y = this.translation.y;
        } else {
            this.translation.x -= (e.deltaX) / this.scale;
            this.translation.y -= (e.deltaY) / this.scale;

            this.targetTranslation.x = this.translation.x;
            this.targetTranslation.y = this.translation.y;
        }
    }
}