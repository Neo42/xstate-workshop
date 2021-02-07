import { createMachine } from 'xstate';

const elBox = document.querySelector('#box');

const machine = createMachine({
  initial: 'inactive',
  states: {
    active: {
      on: {
        CLICK: 'inactive',
      },
    },
    inactive: {
      on: {
        CLICK: 'active',
      },
    },
  },
});

// Change this to the initial state
let currentState = machine.initial;

function send(event) {
  // Determine and update the `currentState`
  currentState = machine.transition(currentState, event);
  elBox.dataset.state = currentState.value;
}

elBox.addEventListener('click', () => send('CLICK'));
