class NLayer {
    constructor(size, inputs, position, randomize = false) {
        this.inputs = inputs;
        this.outputs = new Array(size);
        this.weights = new Array(size);
        this.biases = new Array(size);
        this.pos = position;
        if (randomize) {
            for (let o = 0; o < this.weights.length; o++) {
                this.weights[o] = new Array(this.inputs.length);
                this.biases[o] = random(-1, 1);
                for (let i = 0; i < this.inputs.length; i++) {
                    this.weights[o][i] = random(-1, 1);
                }
            }
        } else {
            for (let o = 0; o < this.weights.length; o++) {
                this.weights[o] = new Array(this.inputs.length);
                this.biases[o] = 0;
                for (let i = 0; i < this.inputs.length; i++) {
                    this.weights[o][i] = 1;
                }
            }
        }
    }
    //Matrix math
    forward(inputs) {
        for (let o = 0; o < this.outputs.length; o++) {
            for (let i = 0; i < inputs.length; i++) {
                this.outputs[o] = inputs[i] * this.weights[o][i];
            }
            this.outputs[o] += this.biases[o];
            if (this.pos != 0) this.outputs[o] = 10 * activate(this.outputs[o]);
        }
        //tanh activation function
        function activate(z) {
            return Math.tanh(z);
        }
    }
    //Returns weights and biases as a list
    get genome() {
        let genome = [];
        genome.push(this.biases);
        for (let o = 0; o < this.outputs.length; o++) {
            genome.push(this.weights[o]);
        }
        return genome;
    }
    //Sets all parameters to the ones specified in the genome
    set genome(genome) {
        this.weights = Array.from(genome.slice(1));
        this.biases = Array.from(genome[0]);
        if (this.pos != 0) {
            for (let o = 0; o < this.weights.length; o++) {
                if (random(100) < 10) {
                    for (let i = 0; i < this.weights[o].length; i++) {
                        this.weights[o][i] = random(-1, 1);
                    }
                    this.biases[o] = random(-1, 1);
                }
            }
        }
    }
    render(x, y, h) {
        this.x = x;
        this.y = y;
        this.r = 8;
        for (let o = 0; o < this.outputs.length; o++) {
            let oY = h * o / (this.outputs.length - 1) + this.y;
            if (this.pos != 0) {
                for (let i = 0; i < this.weights[o].length; i++) {
                    let iY = h * i / (this.weights[o].length - 1) + this.y;
                    strokeWeight(abs(this.weights[o][i]));
                    stroke(126)
                    line(this.x - 30, iY, this.x, oY);
                    strokeWeight(0);
                }
            } if (this.pos == 4) {
                text(round(this.outputs[o]), this.x, oY);
            }
            strokeWeight(abs(this.outputs[o] / 5));
            ellipse(this.x, oY, this.r);
            strokeWeight(0);
        }
    }
}

class NNetwork {
    constructor(inputs, sizes) {
        this.layers = [];
        this.layers[0] = new NLayer(inputs.length, inputs, 0);
        sizes.forEach((size, index) => {
            this.layers[index + 1] = new NLayer(size, this.layers[index].outputs, index + 1, true);
        })
    }
    forward(inputs) {
        this.layers.forEach((layer, index) => {
            index == 0 ? layer.forward(inputs) : layer.forward(this.layers[index - 1].outputs);
        })
    }
    get outputs() {
        return this.layers[this.layers.length - 1].outputs;
    }
    set genome(genome) {
        this.layers.forEach((layer, index) => {
            layer.genome = genome[index]
        });
    }
    get genome() {
        let genome = [];
        this.layers.forEach((layer, index) => {
            genome[index] = layer.genome;
        });
        return genome;
    }
}