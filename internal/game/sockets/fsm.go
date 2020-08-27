package sockets

import "github.com/Akshat-Tripathi/conquer2/internal/game/common"

//State represents the different states of the game
type State = func(name string, action common.Action) bool

//FSM is used to handle the different states a game could be in, and to transition between them
type FSM struct {
	currentFunc func(string, common.Action)
	states      chan State
	transitions chan func()
}

//NewFSM returns a state machine with no transitions
func NewFSM(states ...State) *FSM {
	fsm := &FSM{
		states:      make(chan State, len(states)),
		transitions: make(chan func(), len(states)-1),
	}
	for _, state := range states {
		fsm.states <- state
	}
	return fsm
}

//AddTransitions adds transitions to a FSM
//Transitions must be (no. states - 1)
//A transition occurs once a state has ended
func (fsm *FSM) AddTransitions(tranistions ...func()) {
	for _, transition := range tranistions {
		fsm.transitions <- transition
	}
}

//Start starts the FSM, from here everything is automatic
func (fsm *FSM) Start() {
	state := <-fsm.states
	fsm.currentFunc = func(name string, action common.Action) {
		if state(name, action) {
			fsm.NextState()
		}
	}
}

//NextState is used to go to the next state in the FSM
func (fsm *FSM) NextState() {
	select {
	case state, ok := <-fsm.states:
		if !ok {
			return
		}
		fsm.currentFunc = func(name string, action common.Action) {
			if state(name, action) {
				fsm.NextState()
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
