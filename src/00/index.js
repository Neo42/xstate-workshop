import { createMachine, interpret } from 'xstate';

const elOutput = document.querySelector('#output');

function output(thing) {
  if (typeof thing === 'object') {
    elOutput.innerHTML = JSON.stringify(thing, null, 2);
  } else if (typeof thing === 'string') {
    elOutput.innerHTML = thing;
  }
}

const feedbackMachine = createMachine({
  initial: 'question',
  states: {
    question: {
      on: {
        CLICK_GOOD: 'thanks',
        CLICK_BAD: 'form',
      },
    },
    form: {
      on: {
        SUBMIT: 'thanks',
      },
    },
    thanks: {
      on: {
        CLOSE: 'closed',
      },
    },
    closed: {
      type: 'final',
    },
  },
});

const feedbackService = interpret(feedbackMachine)
  .onTransition((state) => {
    output(state.value);
  });

feedbackService.start();
feedbackService.send('CLICK_GOOD');
feedbackService.send('CLOSE');
feedbackService.stop();
