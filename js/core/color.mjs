export class Color {
    /**
     * @param {Number} r - Red (0 - 255)
     * @param {Number} g - Green (0 - 255)
     * @param {Number} b - Blue (0 - 255)
     * @param {Number} a - Alpha (0 - 1)
     */
    constructor(r, g, b, a) {
        this.a = a;
        this.r = r;
        this.g = g;
        this.b = b;
    }

    /**
     * @param {Color} other - Target color 
     * @param {Number} progress - Transition progress (0 - 1)
     * @returns {Color} - Return color between this and the one specified
     */
    transition(other, progress) {
        return new Color(Math.floor(this.r + (other.r - this.r) * progress),
                            Math.floor(this.g + (other.g - this.g) * progress),
                            Math.floor(this.b + (other.b - this.b) * progress),
                            this.a + (other.a - this.a) * progress);
    }

    /**
     * @returns {String} - Return color string in form: rgba(r, g, b, a)
     */
    getRGBAString() {
        return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
    }

    /**
     * @returns {Color} - Return copy of this color
     */
    copy() {
        return new Color(this.r, this.g, this.b, this.a);
    }

    /**
     * Blends two specified colors based on their alpha channel
     * @param {Color} bg - Background color
     * @param {Color} fg - Foreground color
     * @returns {Color} - Returns blended color
     */
    static blend(bg, fg) {
        let a = 1 - (1 - fg.a) * (1 - bg.a);
        let r = fg.r / 255 * fg.a / a + bg.r / 255 * bg.a * (1 - fg.a) / a;
        let g = fg.g / 255 * fg.a / a + bg.g / 255 * bg.a * (1 - fg.a) / a;
        let b = fg.b / 255 * fg.a / a + bg.b / 255 * bg.a * (1 - fg.a) / a;

        return new Color(Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255), a);
    }
}