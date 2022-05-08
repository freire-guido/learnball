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
                this.biases[o] = 0;
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
        if (this.pos == 0) {
            this.outputs = inputs;
        } else {
            for (let o = 0; o < this.outputs.length; o++) {
                this.outputs[o] = 0
                for (let i = 0; i < inputs.length; i++) {
                    this.outputs[o] += inputs[i] * this.weights[o][i];
                }
                this.outputs[o] += this.biases[o];
                this.outputs[o] = activate(this.outputs[o]);
            }
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
        return JSON.parse(JSON.stringify(genome));
    }
    //Sets all parameters to the ones specified in the genome
    set genome(genome) {
        this.weights = JSON.parse(JSON.stringify(Array.from(genome.slice(1))));
        this.biases = JSON.parse(JSON.stringify(Array.from(genome[0])));
    }
    mutate(prob, biases = true) {
        if (this.pos != 0) {
            for (let o = 0; o < this.weights.length; o++) {
                if (random(100) < prob) {
                    for (let i = 0; i < this.weights[o].length; i++) {
                        this.weights[o][i] = random(-1, 1);
                    }
                    if (biases) {
                        this.biases[o] = random(-1, 1);
                    }
                }
            }
        }
    }
    render(x, y, height, width) {
        this.x = x;
        this.y = y;
        this.r = 8;
        for (let o = 0; o < this.outputs.length; o++) {
            let oY = height * o / (this.outputs.length - 1) + this.y;
            if (this.pos != 0) {
                for (let i = 0; i < this.weights[o].length; i++) {
                    let iY = height * i / (this.weights[o].length - 1) + this.y;
                    strokeWeight(abs(this.weights[o][i]));
                    stroke(126)
                    line(this.x - width, iY, this.x, oY);
                    strokeWeight(0);
                }
            }
            if (this.outputs[o] > 0) {
                fill(0, this.outputs[o] * 255, 0);
            }
            else {
                fill(Math.abs(this.outputs[o] * 255), 0, 0);
            }
            ellipse(this.x, oY, this.r);
            strokeWeight(0);
        }
    }
}

class NNetwork {
    constructor(inputs, sizes, randomize = false) {
        this.layers = [];
        this.layers[0] = new NLayer(inputs.length, inputs, 0, false);
        sizes.forEach((size, index) => {
            this.layers[index + 1] = new NLayer(size, this.layers[index].outputs, index + 1, randomize);
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
        genome = JSON.parse(JSON.stringify(genome))
        return genome;
    }
    render(x, y, height, width) {
        for (let l = this.layers.length - 1; l >= 0; l--) {
            this.layers[l].render((l + 1) * width + x, 10 + y, height, width);
        }
    }
    mutate(prob, biases = true) {
        this.layers.forEach((layer) => {
            layer.mutate(prob, biases)
        })
    }
}