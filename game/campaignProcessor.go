package game

//A state prcoessor for campaign games
type campaignProcessor struct {
	defaultProcessor
	countries             []string
	situation             map[string][]string
	countryStates         map[string]*countryState //Maps countries to players / number of troops
	playerTroops          map[string]*playerState
	startingTroopNumber   int
	startingCountryNumber int
	maxPlayerNum          int
}

/*Overrides:
1: getState()
2: processAction()
*/
