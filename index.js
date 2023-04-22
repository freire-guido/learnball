import { Football } from './football.js';
import { PolicyNetwork } from './network.js';

function train() {
    const numGames = 5;
    // todo: tune policy and game parameters
    const policyNet = new PolicyNetwork([8, 5, 4], tf.train.adam(0.05));
    const football = new Football(0.5, 2);
    for (let i = 0; i < numGames; i++) {
        playGame(policyNet, football);
    }
}

function playGame(policyNet, football) {
    football.setRandomState();
    const gameRewards = [];
    const gameGradients = [];
    const maxStepsPerGame = 100;
    for (let t = 0; t < maxStepsPerGame; t++) {
        const  [ gradients, action ] = policyNet.getGradientsAndActions(football.getStateTensor(0));
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
    renderGame(football);
    return [gameRewards, gameGradients];

    function pushGradients(record, gradients) {
        for (const key in gradients) {
          if (key in record) {
            record[key].push(gradients[key]);
          } else {
            record[key] = [gradients[key]];
          }
        }
    }
}

function renderGame(football) {
    let t = 0
    const canvas = document.getElementById('football');
    const context = canvas.getContext('2d');
    football.players.forEach((player, id) => {
        t++;
    })
}

train();