import Football from './football.js';
import PolicyNetwork from './network.js';

function train() {
    numGames = 5;
    // todo: tune policy and game parameters
    policyNet = PolicyNetwork([8, 5, 4], tf.train.adam(0.05));
    football = Football(0.5, 1);
    for (let i = 0; i < numGames; i++) {
        playGame(policyNet, football);
    }
}

function playGame(policyNet, football) {
    football.setRandomState();
    const gameRewards = [];
    const gameGradients = [];
    for (let t = 0; t < maxStepsPerGame; t++) {
        const  [ gradients, action ] = policyNet.getGradientsAndSaveActions(football.getStateTensor());
        pushGradients(gameGradients, gradients.grad);
        const actions = action // todo: add human input
        const isDone = football.update(actions);
        if (isDone) {
            gameRewards.push(0);
            break;
        } else {
            gameRewards.push(-1);
        }
    }
    pushGradients(policyNet.gradients, gameGradients);
    policyNet.rewards.push(gameRewards);
    // todo: epochs
    policyNet.applyGradients();
    return [gameRewards, gameGradients]
}

function pushGradients(record, gradients) {
    for (const key in gradients) {
      if (key in record) {
        record[key].push(gradients[key]);
      } else {
        record[key] = [gradients[key]];
      }
    }
}