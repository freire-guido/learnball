class NLayer {
    constructor(size, inputs, position) {
      this.test = 0;
      this.inputs = inputs;
      this.outputs = new Array(size);
      this.weights = new Array(size);
      this.biases = new Array(size);
      this.pos = position;
      //Initialize random weights and biases
      if (this.pos != 0) {
        for (let o = 0; o < this.weights.length; o++) {
          this.weights[o] = new Array(this.inputs.length);
          this.biases[o] = random(-1, 1);
          for (let i = 0; i < this.inputs.length; i++) {
            this.weights[o][i] = random(-1, 1);
          }
        }
      }
      else {
        for (let o = 0; o < this.weights.length; o++) {
          this.weights[o] = new Array(this.inputs.length);
          this.biases[o] = 0;
          for (let i = 0; i < this.inputs.length; i++) {
            this.weights[o][i] = 1;
          }
        }
      }
    }
    //Matrix max
    forward(inputs) {
      this.inputs = inputs;
      if (this.pos > 0) {
        for (let o = 0; o < this.outputs.length; o++) {
          this.outputs[o] = 0;
          for (let i = 0; i < this.inputs.length; i++) {
            this.outputs[o] += this.inputs[i] * this.weights[o][i];
          }
          this.outputs[o] += this.biases[o];
          this.outputs[o] = 10 * activate(this.outputs[o]);
        }
      }
      else {
        for (let i = 0; i < this.outputs.length; i++) {
          this.outputs[i] = this.inputs[i];
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
      return genome;
    }
    //Sets all parameters to the ones specified in the genome
    set encode(genome) {
      this.weights = Array.from(genome.slice(1));
      this.biases = Array.from(genome[0]);
      for (let o = 0; o < this.weights.length; o++) {
        //8% mutation chance
        let dice = random(100);
        if (dice < 8) {
          for (let i = 0; i < this.weights[o].length; i++) {
            this.weights[o][i] = random(-1, 1);
          }
          this.biases[o] = 0;
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
        strokeWeight(abs(this.outputs[o] / 400));
        ellipse(this.x, oY, this.r);
        strokeWeight(0);
      }
    }
  }