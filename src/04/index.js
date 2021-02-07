import { createMachine, interpret, assign } from 'xstate';

const elBox = document.querySelector('#box');

const setPoint = (_, event) => {
  elBox.dataset.point = `(${event.clientX}, ${event.clientY})`;
};

const machine = createMachine({
  initial: 'idle',
  context: {
    count: 0,
  },
  states: {
    idle: {
      on: {
        mousedown: {
          actions: [
            setPoint,
            assign({ count: ({ count }) => count + 1 }),
            ({ count }) => console.log({ count }),
          ],
          target: 'dragging',
        },
      },
    },
    dragging: {
      on: {
        mouseup: {
          target: 'idle',
        },
      },
    },
  },
});

const service = interpret(machine);
service.onTransition((state) => { elBox.dataset.state = state.value; });
service.start();

elBox.addEventListener('mousedown', service.send);
elBox.addEventListener('mouseup', service.send);
