const elBox = document.querySelector('#box');
const {
  active,
  inactive,
} = {
  inactive: 'inactive',
  active: 'active',
};
const { CLICK } = { CLICK: 'CLICK' };

// Pure function that returns the next state,
// given the current state and sent event

// function transition(state, event) {
//   switch (state) {
//     case inactive:
//       return event === CLICK
//         ? active
//         : state;
//     case active:
//       return event === CLICK
//         ? inactive
//         : state;
//     default:
//       return state;
//   }
// }

const bluePrint = {
  initial: inactive,
  states: {
    inactive: {
      on: {
        CLICK: active,
      },
    },
    active: {
      on: {
        CLICK: inactive,
      },
    },
  },
};

function interpreter(machine) {
  const transition = (state, event) => machine.states?.[state]?.on?.[event];

  // Keep track of your current state
  let currentState = elBox.dataset.state || machine.initial;

  const send = (event) => {
    // Determine the next value of `currentState`
    const nextstate = transition(currentState, event);
    currentState = nextstate;
    elBox.dataset.state = currentState;
  };
  return { send };
}

elBox.addEventListener('click', () => interpreter(bluePrint).send(CLICK));
