import { createMachine, assign, interpret } from 'xstate';
import { inspect } from '@xstate/inspect';

inspect({ iframe: false });

const elBox = document.querySelector('#box');
const elBody = document.body;
const elButton = document.querySelector('#button');

const isAuthorized = ({ user }) => !!user;
const assignUser = assign({ user: true });
const resetUser = assign({ user: false });

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
  px: 0,
  py: 0,
});

const dragDropMachine = createMachine({
  initial: 'checkingAuth',
  context: {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    px: 0,
    py: 0,
    user: undefined,
  },
  states: {
    checkingAuth: {
      on: {
        '': [{
          cond: isAuthorized,
          target: 'idle',
        },
        'unauthorized',
        ],
      },
    },
    unauthorized: {
      on: {
        'mouseup.authUser': {
          target: 'idle',
          actions: assignUser,
        },
      },
    },
    idle: {
      on: {
        mousedown: {
          actions: assignPoint,
          target: 'dragging',
        },
        'keyup.backspace': {
          target: 'unauthorized',
          actions: resetUser,
        },
      },
    },
    dragging: {
      on: {
        mousemove: {
          actions: assignDelta,
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
  elBox.dataset.state = state.value;

  if (state.changed) {
    console.log(state.context);

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

elButton.addEventListener('mouseup', () => {
  service.send('mouseup.authUser');
});

elBody.addEventListener('keyup', (event) => {
  if (event.key === 'Backspace') {
    service.send('keyup.backspace');
  }
});
