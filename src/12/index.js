import { inspect } from '@xstate/inspect';
import { createMachine, assign, interpret } from 'xstate';

inspect({ iframe: false });

const elBox = document.querySelector('#box');
const elCancel = document.querySelector('#cancel');

const randomFetch = () => new Promise((res, rej) => {
  setTimeout(() => {
    if (Math.random() < 0.5) {
      rej('Fetch failed!');
    } else {
      res('Fetch succeeded!');
    }
  }, 2000);
});

const machine = createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        FETCH: 'pending',
      },
    },
    pending: {
      on: {
        CANCEL: 'idle',
      },
      invoke: {
        // Invoke your promise here.
        // The `src` should be a function that returns the source.
        src: randomFetch,
        onDone: {
          target: 'resolved',
          actions: (_, event) => console.log(event),
        },
        onError: {
          target: 'rejected',
        },
      },
    },
    resolved: {
      // Add a transition to fetch again
      on: {
        FETCH: 'pending',
      },
    },
    rejected: {
      // Add a transition to fetch again
      on: {
        FETCH: 'pending',
      },
    },
  },
});

const service = interpret(machine, { devTools: true });

service.onTransition((state) => {
  elBox.dataset.state = state.toStrings().join(' ');
  console.log(state);
});

service.start();

elBox.addEventListener('click', () => {
  service.send('FETCH');
});

elCancel.addEventListener('click', () => {
  service.send('CANCEL');
});
