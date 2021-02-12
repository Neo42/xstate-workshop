import { inspect } from '@xstate/inspect';
import {
  createMachine, assign, interpret, send,
} from 'xstate';

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
        I_AM_DONE: 'resolved',
        SEND_IT_ALREADY: {
          actions: send({
            type: 'SEND_IT_ALREADY',
          }, {
            to: 'child',
          }),
        },
      },
      invoke: {
        // Invoke your promise here.
        // The `src` should be a function that returns the source.
        id: 'child',
        src: (context, event) => (sendBack, receive) => {
          receive((e) => {
            if (e.type === 'SEND_IT_ALREADY') {
              sendBack({
                type: 'I_AM_DONE',
              });
            }
          });
        },
        // randomFetch,
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
  service.send('SEND_IT_ALREADY');
});
