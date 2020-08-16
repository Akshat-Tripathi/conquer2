package game

//State represents the different states of the game
type State = func(name string, action Action) bool

//FSM is used to handle the different states a game could be in, and to transition between them
type FSM struct {
	currentFunc func(string, Action)
	states      chan State
	transitions chan func()
}

func newFSM(states ...State) *FSM {
	fsm := &FSM{
		states:      make(chan State, len(states)),
		transitions: make(chan func(), len(states)-1),
	}
	for _, state := range states {
		fsm.states <- state
	}
	return fsm
}

func (fsm *FSM) addTransitions(tranistions ...func()) {
	for _, transition := range tranistions {
		fsm.transitions <- transition
	}
}

func (fsm *FSM) start() {
	state := <-fsm.states
	fsm.currentFunc = func(name string, action Action) {
		if state(name, action) {
			fsm.nextState()
		}
	}
}

func (fsm *FSM) nextState() {
	select {
	case state, ok := <-fsm.states:
		if !ok {
			return
		}
		fsm.currentFunc = func(name string, action Action) {
			if state(name, action) {
				fsm.nextState()
			}
		}
		transition, ok := <-fsm.transitions
		if ok {
			transition()
		}
	default:
		close(fsm.states)
	}
}
