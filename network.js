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
                inputShape: i === 0 ? [2, 2] : undefined
            }));
        });
        this.policyNet.add(tf.layers.dense({units: 1}));
    }
    getGradientsAndSaveActions(inputTensor) {
        const f = () => tf.tidy(() => {
            const logits = this.policyNet.predict(inputTensor.expandDims(0)).reshape([2, 1]);
            const sig = tf.sigmoid(logits); // err: sig negative
            const probs = tf.concat([sig, tf.sub(1, sig)], 1);
            const actions = tf.multinomial(probs, 1, null, true).mul(sig.sign());
            this.actions = actions.dataSync(); // err: grad multinomial
            return tf.losses.sigmoidCrossEntropy(tf.sub(1, tf.tensor2d(this.actions, actions.shape)), logits).asScalar(); // todo: tf.sub(-1, actions) ?
        });
        return tf.variableGrads(f);
    }
    applyGradients() {
        tf.tidy(() => {
            const discountedRewards = this.discountAndNormalizeRewards(this.rewards, 0.9);
            this.optimizer.applyGradients(this.scaleAndAverageGradients(this.gradients, discountedRewards));
        });
    }
    discountRewards(rewards, discountRate) {
        const discountedBuffer = tf.buffer([rewards.length]);
        let prev = 0;
        for (let i = rewards.length - 1; i >= 0; --i) {
            const current = discountRate * prev + rewards[i];
            discountedBuffer.set(current, i);
            prev = current;
        }
        return discountedBuffer.toTensor();
    }
    discountAndNormalizeRewards(rewardSequences, discountRate) {
        return tf.tidy(() => {
            const discounted = [];
            for (const sequence of rewardSequences) {
                discounted.push(this.discountRewards(sequence, discountRate))
            }
            const concatenated = tf.concat(discounted);
            const mean = tf.mean(concatenated);
            const std = tf.sqrt(tf.mean(tf.square(concatenated.sub(mean))));
            const normalized = discounted.map(rs => rs.sub(mean).div(std));
            return normalized;
        });
    }
    scaleAndAverageGradients(allGradients, normalizedRewards) {
        // todo: implement
        return allGradients
      }
}