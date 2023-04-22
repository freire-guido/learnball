class PolicyNetwork {
    construct(hiddenLayerSizes, optimizer) {
        this.optimizer =  optimizer
        this.policyNet = tf.sequential();
        hiddenLayerSizes.forEach((hiddenLayerSize, i) => {
          this.policyNet.add(tf.layers.dense({
            units: hiddenLayerSize,
            activation: 'relu',
            inputShape: i === 0 ? [3, 2] : undefined
          }));
        });
        this.policyNet.add(tf.layers.dense({units: 2}));
    }
    getGradientsAndActions(inputTensor) {
        const f = () => tf.tidy(() => {
            const logits = this.policyNet.predict(inputTensor);
            const sig = tf.sigmoid(logits);
            const probs = sig.transpose().concat(tf.sub(1, sig).transpose(), 1);
            const actions = tf.multinomial(probs, 1, null, true).transpose();
            return tf.losses.sigmoidCrossEntropy(tf.sub(1, actions), logits).asScalar(); // todo: tf.sub(-1, actions) ?
        });
        return [tf.variableGrads(f), actions];
    }
    pushGradients(record, gradients) {
        for (const key in gradients) {
          if (key in record) {
            record[key].push(gradients[key]);
          } else {
            record[key] = [gradients[key]];
          }
        }
      }
}