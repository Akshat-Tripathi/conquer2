import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import {
    Typography,
    IconButton,
    Select,
    Button,
    Input,
    MenuItem,
    FormHelperText,
    FormControl,
} from "@material-ui/core";

//import { players, fromCountryISO, toCountryISO, socket, countryStates } from './Map';

const Options = ({
    classes,
    fromCountry,
    toCountry,
    toCountryOwner,
    fromCountryISO,
    toCountryISO,
    allowMove,
    handleNumTroops,
    numTroops,
    showMove,
    showAssist,
    handleMove,
    handleAssist,
    fillTroops,
    socket,
    user,
    reset,
}) => {
    if (toCountry !== "" && fromCountry !== "") {
        return (
            <div>
                <Typography variant="h5">
                    {" "}
                    From <span style={{ color: "lightgreen" }}>
                        {fromCountry}
                    </span> To <span style={{ color: "red" }}>{toCountry}</span>
                </Typography>

                {!allowMove ? (
                    <div>
                        {toCountryOwner !== user ? (
                            <div>
                                <Button
                                    variant="contained"
                                    size="small"
                                    color="secondary"
                                    className={classes.button}
                                    onClick={() => {
                                        attack(fromCountryISO, toCountryISO, socket);
                                        reset();
                                    }}
                                >
                                    ATTACK
                                </Button>

                                <Button
                                    variant="contained"
                                    size="small"
                                    color="secondary"
                                    className={classes.button}
                                    onClick={() => {
                                        megaAttack(fromCountryISO, toCountryISO, socket);
                                        reset();
                                    }}
                                >
                                    AUTO ATTACK LIKE IT'S 'NAM
                                </Button>
                            </div>
                        ) : null}

                        <AssistForm
                            showAssist={showAssist}
                            handleNumTroops={handleNumTroops}
                            fillTroops={fillTroops}
                            numTroops={numTroops}
                            classes={classes}
                            handleAssist={handleAssist}
                            fromCountryISO={fromCountryISO}
                            toCountryISO={toCountryISO}
                            socket={socket}
                            user={user}
                            reset={reset}
                        />
                    </div>
                ) : (
                    <div>
                        <MoveForm
                            showMove={showMove}
                            handleNumTroops={handleNumTroops}
                            fillTroops={fillTroops}
                            numTroops={numTroops}
                            classes={classes}
                            handleMove={handleMove}
                            fromCountryISO={fromCountryISO}
                            toCountryISO={toCountryISO}
                            socket={socket}
                            user={user}
                            reset={reset}
                        />
                    </div>
                )}
            </div>
        );
    }
};

const DonateForm = ({
    handleDonate,
    classes,
    handleNumTroops,
    handletargetPlayer,
    fillTroops,
    targetPlayer,
    showDonate,
    numTroops,
    socket,
    user,
    players,
    reset,
}) => {
    return !showDonate ? (
        <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={handleDonate}
            style={{ textAlign: "center", alignItems: "center" }}
        >
            DONATE
        </Button>
    ) : (
        <table cellSpacing="5px" style={{ minWidth: "100%" }}>
            <tr>
                <FormControl className={classes.input}>
                    <Select
                        name="donateTo"
                        required
                        variant="outlined"
                        value={targetPlayer}
                        onChange={handletargetPlayer}
                        style={{
                            color: "red",
                            backgroundColor: "white",
                            borderRadius: "20px",
                            height: "3rem",
                        }}
                    >
                        {players.map(function (p) {
                            if (p !== user) {
                                return <MenuItem value={p}>{p}</MenuItem>;
                            }
                        })}
                    </Select>

                    <FormHelperText style={{ color: "white", textAlign: "center" }}>
                        Select Player to Donate to
                    </FormHelperText>
                </FormControl>
            </tr>
            <tr>
                <FormControl classes={classes.input}>
                    <Input
                        autoFocus
                        type="number"
                        onKeyPress={(e) => {
                            if (e.key === "f" || e.key === "F") {
                                fillTroops(1);
                            } else if (e.key === "h" || e.key === "H") {
                                fillTroops(0.5);
                            }
                        }}
                        min="0"
                        name="donateNumTroops"
                        required
                        variant="outlined"
                        label="Number of Troops to Donate"
                        value={numTroops > 0 ? numTroops : null}
                        onChange={handleNumTroops}
                        style={{
                            color: "red",
                            backgroundColor: "white",
                            height: "3rem",
                            borderRadius: "20px",
                            padding: "5px",
                        }}
                    />

                    <FormHelperText style={{ color: "white", textAlign: "center" }}>
                        Select Number of Troops to Donate
                    </FormHelperText>
                </FormControl>
            </tr>
            <tr>
                <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    className={classes.button}
                    onClick={() => {
                        donate(numTroops, targetPlayer, socket);
                        reset();
                    }}
                >
                    CONFIRM DONATION
                </Button>
            </tr>
            <IconButton aria-label="return" color="secondary" onClick={handleDonate}>
                <ArrowBackIcon
                    style={{
                        fontSize: "30",
                    }}
                />
                <Typography variant="subtitle2">Back</Typography>
            </IconButton>
        </table>
    );
};

const AssistForm = ({
    numTroops,
    classes,
    handleNumTroops,
    fillTroops,
    showAssist,
    handleAssist,
    fromCountryISO,
    toCountryISO,
    socket,
    user,
    reset,
}) => {
    return !showAssist ? (
        <Button
            variant="contained"
            size="small"
            color="primary"
            className={classes.button}
            onClick={handleAssist}
        >
            ASSIST
        </Button>
    ) : (
        <div>
            <FormControl classes={classes.input}>
                <Input
                    autoFocus
                    type="number"
                    onKeyPress={(e) => {
                        if (e.key === "f" || e.key === "F") {
                            fillTroops(1);
                        } else if (e.key === "h" || e.key === "H") {
                            fillTroops(0.5);
                        }
                    }}
                    min="0"
                    name="donateNumTroops"
                    required
                    variant="outlined"
                    label="Number of Troops for the Assist"
                    value={numTroops > 0 ? numTroops : null}
                    onChange={handleNumTroops}
                    style={{ color: "yellow", borderColor: "white" }}
                />
                <FormHelperText style={{ color: "white" }}>
                    Select Number of Troops to send{" "}
                </FormHelperText>
            </FormControl>
            <Button
                variant="outlined"
                size="small"
                color="primary"
                className={classes.button}
                onClick={() => {
                    assist(numTroops, fromCountryISO, toCountryISO, socket);
                    reset();
                }}
            >
                CONFIRM ASSISTANCE
            </Button>

            <IconButton
                aria-label="return"
                color="secondary"
                onClick={() => {
                    handleAssist();
                    reset();
                }}
            >
                <ArrowBackIcon
                    style={{
                        fontSize: "30",
                    }}
                />
                <Typography variant="subtitle2">Back</Typography>
            </IconButton>
        </div>
    );
};

const MoveForm = ({
    numTroops,
    classes,
    handleNumTroops,
    fillTroops,
    showMove,
    handleMove,
    fromCountryISO,
    toCountryISO,
    socket,
    user,
    reset,
}) => {
    return !showMove ? (
        <Button
            variant="contained"
            size="small"
            color="secondary"
            className={classes.button}
            onClick={handleMove}
        >
            MOVE
        </Button>
    ) : (
        <div>
            <FormControl classes={classes.input}>
                <Input
                    autoFocus
                    type="number"
                    onKeyPress={(e) => {
                        if (e.key === "f" || e.key === "F") {
                            fillTroops(1);
                        } else if (e.key === "h" || e.key === "H") {
                            fillTroops(0.5);
                        }
                    }}
                    min="0"
                    name="donateNumTroops"
                    required
                    variant="outlined"
                    placeholder={5}
                    label="Number of Troops to Move"
                    value={numTroops > 0 ? numTroops : null}
                    onChange={handleNumTroops}
                    className={classes.input}
                    style={{ color: "yellow", borderColor: "white" }}
                />
                <FormHelperText style={{ color: "white" }}>
                    Select Number of Troops to move
                </FormHelperText>
            </FormControl>

            <Button
                variant="outlined"
                size="small"
                color="primary"
                className={classes.button}
                onClick={() => {
                    move(numTroops, fromCountryISO, toCountryISO, socket);
                    reset();
                }}
            >
                CONFIRM MOVE
            </Button>

            <IconButton
                aria-label="return"
                color="secondary"
                onClick={() => {
                    handleMove();
                    reset();
                }}
            >
                <ArrowBackIcon
                    style={{
                        fontSize: "30",
                    }}
                />
                <Typography variant="subtitle2">Back</Typography>
            </IconButton>
        </div>
    );
};

const DeployForm = ({
    classes,
    numTroops,
    handleNumTroops,
    fillTroops,
    fromCountry,
    handleDeploy,
    showDeploy,
    fromCountryISO,
    socket,
    user,
    reset,
}) => {
    function handleClick(e) {
        e.preventDefault();
        deploy(numTroops, fromCountryISO, socket);
        reset();
    }
    return (
        <div>
            <Typography variant="h5">
                <span>
                    Buy troops in&ensp;
                    {/*<strong>
				<span style={{ color: 'green' }}>Base</span>
			</strong> to*/}
                    <strong>
                        <span style={{ color: "orange" }}>{fromCountry}</span>
                    </strong>
                </span>
            </Typography>
            {!showDeploy ? (
                <Button
                    variant="contained"
                    size="small"
                    color="secondary"
                    className={classes.button}
                    onClick={handleDeploy}
                >
                    BUY
                </Button>
            ) : (
                <div>
                    <FormControl classes={classes.input}>
                        <Input
                            autoFocus
                            type="number"
                            onKeyPress={(e) => {
                                if (e.key === "f" || e.key === "F") {
                                    fillTroops(1);
                                } else if (e.key === "h" || e.key === "H") {
                                    fillTroops(0.5);
                                }
                            }}
                            min="0"
                            name="donateNumTroops"
                            required
                            variant="outlined"
                            placeholder={5}
                            label="Number of Troops to Buy"
                            value={numTroops > 0 ? numTroops : null}
                            onChange={handleNumTroops}
                            className={classes.input}
                            style={{ color: "yellow", borderColor: "white" }}
                        />
                        <FormHelperText style={{ color: "white" }}>
                            Select Number of Troops to Buy
                        </FormHelperText>
                    </FormControl>

                    <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        className={classes.button}
                        onClick={handleClick}
                    >
                        BUY
                    </Button>
                    <IconButton
                        aria-label="return"
                        color="secondary"
                        onClick={() => {
                            handleDeploy();
                            reset();
                        }}
                    >
                        <ArrowBackIcon
                            style={{
                                fontSize: "30",
                            }}
                        />
                        <Typography variant="subtitle2">Back</Typography>
                    </IconButton>
                </div>
            )}
        </div>
    );
};

class action {
    constructor(Troops, ActionType, Src, Dest) {
        this.Troops = Troops;
        this.ActionType = ActionType;
        this.Src = Src;
        this.Dest = Dest;
    }
}

var lastAction = null;

function takeAction(wrapped) {
    return function () {
        let act = wrapped.apply(this, arguments);
        let socket = arguments[arguments.length - 1];
        lastAction = act;
        socket.send(JSON.stringify(act));
    }
}

let repeatAction = takeAction((socket) => lastAction);


let attack = takeAction((fromCountryISO, toCountryISO, socket) => {
    return new action(1, "attack", fromCountryISO, toCountryISO);
})


let megaAttack = takeAction((fromCountryISO, toCountryISO, socket) => {
    return new action(10, "attack", fromCountryISO, toCountryISO);
})


let donate = takeAction((numTroops, targetPlayer, socket) => {
    return new action(
        parseInt(numTroops, 10),
        "donate",
        "",
        targetPlayer,
    );
})


let move = takeAction((numTroops, fromCountryISO, toCountryISO, socket) => {
    return new action(
        parseInt(numTroops, 10),
        "move",
        fromCountryISO,
        toCountryISO
    );
})


let assist = takeAction((numTroops, fromCountryISO, toCountryISO, socket) => {
    return new action(
        parseInt(numTroops, 10),
        "assist",
        fromCountryISO,
        toCountryISO
    );
})


let deploy = takeAction((numTroops, fromCountryISO, socket) => {
    return new action(
        parseInt(numTroops, 10),
        "deploy",
        "",
        fromCountryISO
    );
})

let proposeAlliance = takeAction((targetPlayer, cost, user, socket) => {
    return new action(
        parseInt(cost, 10),
        "propose",
        user,
        targetPlayer
    );
})

let declineAlliance = takeAction((targetPlayer, user, socket) => {
    return new action(
        0,
        "decline",
        targetPlayer,
        user
    );
})

let acceptAlliance = takeAction((targetPlayer, user, socket) => {
    return new action(
        0,
        "accept",
        targetPlayer,
        user
    );
})

export { Options, DeployForm as OptionsDeploy, DonateForm, action, repeatAction };
