import { createMachine, assign, interpret } from 'xstate';

const elBox = document.querySelector('#box');
const elBody = document.body;

const setDelta = assign({
  dx: ({ px }, event) => event.clientX - px,
  dy: ({ py }, event) => event.clientY - py,
});

const showDelta = ({ dx, dy }) => { elBox.dataset.delta = `delta: (${dx}, ${dy})`; };
const resumeDelta = () => { elBox.dataset.delta = 'delta: (0, 0)'; };

const setPosition = assign({
  px: (_, event) => event.clientX,
  py: (_, event) => event.clientY,
});

const setRestingPosition = assign({
  x: ({ x, dx }) => x + dx,
  y: ({ y, dy }) => y + dy,
  dx: 0,
  dy: 0,
  px: 0,
  py: 0,
});

const resume = assign({
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
  px: 0,
  py: 0,
});

const machine = createMachine({
  initial: 'idle',
  context: {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    px: 0,
    py: 0,
  },
  states: {
    idle: {
      on: {
        mousedown: {
          target: 'dragging',
          actions: setPosition,
        },
        'keyup.Escape': {
          target: 'idle',
          actions: [resume, resumeDelta],
        },
      },
    },
    dragging: {
      on: {
        mousemove: {
          actions: [setDelta, showDelta],
        },
        mouseup: {
          actions: setRestingPosition,
          target: 'idle',
        },
      },
    },
  },
});

const service = interpret(machine);

service.onTransition((state) => {
  if (state.changed) {
    console.log(state.context);

    elBox.dataset.state = state.value;

    elBox.style.setProperty('--dx', state.context.dx);
    elBox.style.setProperty('--dy', state.context.dy);
    elBox.style.setProperty('--x', state.context.x);
    elBox.style.setProperty('--y', state.context.y);
  }
});

service.start();

elBox.addEventListener('mousedown', service.send);
elBody.addEventListener('mousemove', service.send);
elBody.addEventListener('mouseup', service.send);
elBody.addEventListener('keyup', (event) => {
  if (event.key === 'Escape') {
    service.send('keyup.Escape');
  }
});
