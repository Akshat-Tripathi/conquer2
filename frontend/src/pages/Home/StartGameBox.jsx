import React from "react";
import {
  Typography,
  Box,
  makeStyles,
  Button,
  TextField,
  Paper,
  Slider,
} from "@material-ui/core";

//TODO: Add username var here and set accordingly.
var username = "";

function StartGameBox(props) {
  const useStyles = makeStyles((theme) => ({
    paper: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
      padding: theme.spacing(2),
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  }));
  const handleUsername = () => {
    username = document.getElementById("ign");
  };
  const valuetext = (troopsInterval) => {
    return `${troopsInterval} Troop Interval`;
  };
  return (
    // <div className="wrapper">
    //   <div className="form-wrapper">
    <div>
      <Paper styles={{}}>
        <Box style={{ paddingTop: "10%" }}>
          <h3 className="gamebox-title">Join the game!</h3>

          <form action="/join" method="POST">
            <TextField
              type="text"
              id="ign"
              placeholder="Username"
              name="username"
              required
              onChange={handleUsername}
            />

            <div>
              <TextField
                type="password"
                placeholder="Password"
                name="password"
                required
              />
            </div>
            <div>
              <TextField type="text" placeholder="Game Id" name="id" required />
            </div>
            <Button
              type="submit"
              name="submit"
              value="join"
              variant="contained"
              color="primary"
            >
              Join Game
            </Button>
          </form>
        </Box>

        <Box>
          <form action="/create" method="POST">
            <select className="gamemode" name="type" required>
              <option value="realtime">Realtime game</option>
            </select>
            <div>
              <TextField
                type="text"
                placeholder="Username"
                name="username"
                required
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                type="password"
                placeholder="Password"
                name="password"
                required
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                className="noOfPlayers"
                type="number"
                placeholder="maxPlayers"
                name="maxPlayers"
                required
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                type="number"
                placeholder="startingTroops"
                name="startingTroops"
                required
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                type="number"
                placeholder="startingCountries"
                name="startingCountries"
                required
                variant="outlined"
              />
            </div>
            <div>
              <Typography id="troopInterval" gutterBottom>
                Small steps
              </Typography>
              <Slider
                defaultValue={0.00000005}
                getAriaValueText={valuetext}
                aria-labelledby="troopInterval"
                step={1}
                marks
                min={1}
                max={10}
                valueLabelDisplay="auto"
              />
            </div>
            <Button
              type="submit"
              name="submit"
              value="create"
              variant="contained"
              color="secondary"
            >
              Commence WAR
            </Button>
          </form>
        </Box>
      </Paper>
    </div>
  );
}

export default StartGameBox;
export { username };
