import { createMachine, interpret } from 'xstate';

const elBox = document.querySelector('#box');

const machine = createMachine({
  initial: 'inactive',
  states: {
    active: {
      entry: 'activeEntry',
      exit: 'activeExit',
      on: {
        mouseup: {
          target: 'inactive',
          actions: 'activeAction',
        },
      },
    },
    inactive: {
      entry: 'inactiveEntry',
      exit: 'inactiveExit',
      on: {
        mousedown: {
          target: 'active',
          actions: 'inactiveAction',
        },
      },
    },
  },
}, {
  actions: {
    activeEntry() {
      console.log('%c3: Enter active\n', 'color:lightpink');
    },
    activeExit() {
      console.log('%c4: Exit active', 'color:lightpink');
    },
    activeAction() {
      console.log('%c5: Fire mouseup', 'color:#dfffdf');
    },
    inactiveEntry() {
      console.log('%c0: Enter inactive\n', 'color:lightpink');
    },
    inactiveExit() {
      console.log('%c1: Exit inactive', 'color:lightpink');
    },
    inactiveAction() {
      console.log('%c2: Fire mousedown', 'color:#dfffdf');
    },
  },
});

const service = interpret(machine);
service
  .onTransition((state) => {
    elBox.dataset.state = state.value;
  })
  .start();

elBox.addEventListener('mousedown', (event) => service.send(event));
elBox.addEventListener('mouseup', (event) => service.send(event));
