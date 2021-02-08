import { createMachine, assign, interpret } from 'xstate';

const elBox = document.querySelector('#box');
const elBody = document.body;

const assignDrags = assign({
  drags: ({ drags }) => drags - 1,
});

const dragsExceeded = assign({
  drags: ({ drags }) => (drags === 0 ? 'no' : drags),
});

const assignPoint = assign({
  px: (_, event) => event.clientX,
  py: (_, event) => event.clientY,
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
  x: 0,
  y: 0,
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
    drags: 5,
  },
  states: {
    idle: {
      entry: dragsExceeded,
      on: {
        'keyup.escape': {
          target: 'idle',
          actions: resetPosition,
        },
        mousedown: [{
          target: 'dragging',
          actions: assignPoint,
          cond: ({ drags }) => drags > 0,
        }],
      },
    },
    dragging: {
      entry: assignDrags,
      on: {
        mousemove: {
          actions: assignDelta,
        },
        mouseup: [{
          actions: assignPosition,
          target: 'idle',
        }],
      },
    },
  },
});

const service = interpret(machine);

service.onTransition((state) => {
  if (state.changed) {
    elBox.dataset.state = state.value;
    elBox.dataset.drags = state.context.drags;
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
