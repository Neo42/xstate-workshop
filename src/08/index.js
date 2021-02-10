import { createMachine, assign, interpret } from 'xstate';
import { inspect } from '@xstate/inspect';

inspect({ iframe: false });

const elBox = document.querySelector('#box');
const elBody = document.body;

const assignPoint = assign({
  px: (event) => event.clientX,
  py: (event) => event.clientY,
});

const assignPosition = assign({
  x: (context) => context.x + context.dx,
  y: (context) => context.y + context.dy,
  dx: 0,
  dy: 0,
  px: 0,
  py: 0,
});

const assignDelta = assign({
  dx: (context, event) => event.clientX - context.px,
  dy: (context, event) => event.clientY - context.py,
});

const resetPosition = assign({
  dx: 0,
  dy: 0,
  px: 0,
  py: 0,
});

const dragDropMachine = createMachine({
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
          actions: assignPoint,
          target: 'dragging',
        },
      },
    },
    dragging: {
      on: {
        mousemove: {
          actions: assignDelta,
          internal: false,
        },
        mouseup: {
          actions: assignPosition,
          target: 'idle',
        },
        'keyup.escape': {
          target: 'idle',
          actions: resetPosition,
        },
      },
      after: {
        2000: {
          target: 'idle',
          actions: resetPosition,
        },
      },
    },
  },
});

const service = interpret(dragDropMachine, { devTools: true });

service.onTransition((state) => {
  elBox.dataset.state = state.value;

  if (state.changed) {
    elBox.style.setProperty('--dx', state.context.dx);
    elBox.style.setProperty('--dy', state.context.dy);
    elBox.style.setProperty('--x', state.context.x);
    elBox.style.setProperty('--y', state.context.y);
  }
});

service.start();

elBox.addEventListener('mousedown', (event) => {
  service.send(event);
});

elBody.addEventListener('mousemove', (event) => {
  service.send(event);
});

elBody.addEventListener('mouseup', (event) => {
  service.send(event);
});

elBody.addEventListener('keyup', (event) => {
  if (event.key === 'Escape') {
    service.send('keyup.escape');
  }
});
