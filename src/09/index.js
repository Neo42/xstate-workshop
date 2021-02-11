import { inspect } from '@xstate/inspect';
import { createMachine, assign, interpret } from 'xstate';

inspect({ iframe: false });

const elBox = document.querySelector('#box');
const elBody = document.body;

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

const assignXDelta = assign({
  dx: (context, event) => event.clientX - context.px,
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
      initial: 'normal',
      states: {
        normal: {
          on: {
            'keydown.shift': {
              target: 'locked',
            },
          },
        },
        locked: {
          on: {
            'keyup.shift': {
              target: 'normal',
            },
            mousemove: {
              actions: assignXDelta,
            },
          },
        },
      },
      on: {
        mousemove: {
          actions: assignDelta,
          internal: false,
        },
        mouseup: {
          actions: [assignPosition],
          target: 'idle',
        },
        'keyup.escape': {
          target: 'idle',
          actions: resetPosition,
        },
      },
    },
  },
});

const service = interpret(dragDropMachine, { devTools: true });

service.onTransition((state) => {
  elBox.dataset.state = state.toStrings().join(' ');

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

elBody.addEventListener('keyup', (e) => {
  if (e.key === 'Escape') {
    service.send('keyup.escape');
  }
});

elBody.addEventListener('keydown', (e) => {
  if (e.key === 'Shift') {
    service.send('keydown.shift');
  }
});

elBody.addEventListener('keydown', (e) => {
  if (e.key === 'Shift') {
    service.send('keydown.shift');
  }
});

elBody.addEventListener('keyup', (e) => {
  if (e.key === 'Shift') {
    service.send('keyup.shift');
  }
});
