export class PolicyNetwork {
    constructor(hiddenLayerSizes, optimizer) {
        this.gradients = [];
        this.rewards = [];
        this.optimizer =  optimizer
        this.policyNet = tf.sequential();
        hiddenLayerSizes.forEach((hiddenLayerSize, i) => {
            this.policyNet.add(tf.layers.dense({
                units: hiddenLayerSize,
                activation: 'relu',
                inputShape: i === 0 ? [2, 3] : undefined
            }));
        });
        this.policyNet.add(tf.layers.dense({units: 1}));
    }
    getGradientsAndActions(inputTensor) {
        const f = () => tf.tidy(() => {
            const logits = this.policyNet.predict(inputTensor.expandDims(0)).reshape([2, 1]);
            const sig = tf.sigmoid(logits);
            const probs = tf.concat([sig, tf.sub(1, sig)], 1);
            const actions = tf.multinomial(probs, 1, null, true);
            return tf.losses.sigmoidCrossEntropy(tf.sub(1, actions), logits).asScalar(); // todo: tf.sub(-1, actions) ?
        });
        return [tf.variableGrads(f), actions];
    }
    applyGradients() {
        tf.tidy(() => {
            const discountedRewards = discountAndNormalizeRewards(this.rewards);
            this.optimizer.applyGradients(scaleAndAverageGradients(this.gradients, discountedRewards));
        });
    }
    discountAndNormalizeRewards(rewards) {
        // todo: implement
        return rewards
    }
    scaleAndAverageGradients(allGradients, normalizedRewards) {
        // todo: implement
        return allGradients
      }
}