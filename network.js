export class PolicyNetwork {
    constructor(hiddenLayerSizes, optimizer) {
        this.gradients = [];
        this.rewards = [];
        this.optimizer =  optimizer
        this.policyNet = tf.sequential();
        hiddenLayerSizes.forEach((hiddenLayerSize, i) => {
            console.log(i === 0 ? [3, 2] : undefined);
            this.policyNet.add(tf.layers.dense({
                units: hiddenLayerSize,
                activation: 'relu',
                inputShape: i === 0 ? [5, 8] : undefined
            }));
        });
        this.policyNet.add(tf.layers.dense({units: 2}));
    }
    getGradientsAndActions(inputTensor) {
        const f = () => tf.tidy(() => {
            console.log(inputTensor.shape)
            console.log(this.policyNet.inputShape)
            const logits = this.policyNet.predict(inputTensor);
            const sig = tf.sigmoid(logits);
            const probs = sig.transpose().concat(tf.sub(1, sig).transpose(), 1);
            const actions = tf.multinomial(probs, 1, null, true).transpose();
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