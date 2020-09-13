class Graph {
    constructor(ii) {
        this.inputs = ii;
    }
    set input(input) {
        this.inputs.push(input);
    }
    render(xx, yy, ss) {
        this.x = xx;
        this.y = yy;
        this.s = ss;
        for (var i = 1; i < this.inputs.length; i++) {
            strokeWeight(2);
            line((i - 1) * this.s + this.x, this.inputs[i - 1] + this.y, i * this.s + this.x, -this.inputs[i] + this.y);
        }
        noStroke();
        text(-this.inputs[i - 1], i * this.s + this.x, -this.inputs[i - 1] + this.y);
    }
}