import { Layer } from "./layer.mjs";

export class LayerPicker {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;

        this.width = canvasManager.canvas.width * 0.075;
        this.translation = 0;

        this.hoveredLayer = null;
    }

    /**
     * Updates state of picker before rendering
     */
    update() {
        this.hoveredLayer = null;
    }

    /**
     * Draws picker ui on specified context
     * @param {CanvasRenderingContext2D} context - Context for drawing
     */
    render(context) {
        context.fillStyle = "rgba(0, 0, 0, 0.5)";
        context.fillRect(this.canvasManager.canvas.width - this.width, 0, this.width, this.canvasManager.canvas.height);

        this.scale = this.width * 0.7 / this.canvasManager.drawingLayer.width;
        let margin = this.translation + this.width * 0.15;

        this.drawPreview(context, this.canvasManager.drawingLayer, margin);
        margin += this.width * 0.15 + this.canvasManager.drawingLayer.height * this.scale;

        this.drawSeparator(context, margin);
        margin += this.width * 0.15;

        for (let i = 0; i < this.canvasManager.layerComposer.layers.length; i++) {
            this.drawPreview(context, this.canvasManager.layerComposer.layers[i], margin);
            margin += this.width * 0.15 + this.canvasManager.layerComposer.layers[i].height * this.scale;
        }

        this.maxMargin = margin - this.translation + this.width * 0.15;
    }

    /**
     * Draws preview of specified layer to the context
     * @param {CanvasRenderingContext2D} context - Context for drawing
     * @param {Layer} layer - Layer to be drawn
     * @param {Number} margin - Margin from top
     */
    drawPreview(context, layer, margin) {
        context.save();
        context.translate(this.canvasManager.canvas.width - this.width * 0.85, margin);
        context.scale(this.scale, this.scale);

        if (this.canvasManager.mousePointerPosition.x > this.canvasManager.canvas.width - this.width && this.canvasManager.mousePointerPosition.y > margin && this.canvasManager.mousePointerPosition.y < margin + layer.height * this.scale) {
            context.fillStyle = "rgba(255, 255, 255, 0.1)";
            context.fillRect(-this.width / this.scale * 0.1, -this.width / this.scale * 0.05, this.width / this.scale * 0.9, layer.height + this.width / this.scale * 0.1);
            
            this.hoveredLayer = layer;
        }

        context.drawImage(layer.buffer, 0, 0);

        context.restore();
    }

    /**
     * Draws line separating layers
     * @param {CanvasRenderingContext2D} context - Context for drawing
     * @param {Number} margin - Margin from top
     */
    drawSeparator(context, margin) {
        context.strokeStyle = "rgba(255, 255, 255, 0.5)";
        context.beginPath();
        context.moveTo(this.canvasManager.canvas.width - this.width, margin);
        context.lineTo(this.canvasManager.canvas.width, margin);
        context.stroke();
    }

    /**
     * Handle mouse scrolling
     * @param {MouseWheelEvent} e - Event
     */
    onScroll(e) {
        let rect = this.canvasManager.canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        if (x > this.canvasManager.canvas.width - this.width) {
            this.translation -= e.deltaY;

            if (this.translation > 0) this.translation = 0;

            if (-this.translation + this.canvasManager.canvas.height > this.maxMargin) 
                if (this.maxMargin > this.canvasManager.canvas.height)
                    this.translation = -this.maxMargin + this.canvasManager.canvas.height;
                else
                    this.translation = 0;

            return true;
        }

        return false;
    }

    /**
     * Handle changing selected layer
     */
    onMouseDown() {
        if (this.hoveredLayer != null) {
            this.canvasManager.selectedLayer = this.hoveredLayer;

            return true;
        }

        return false;
    }
}