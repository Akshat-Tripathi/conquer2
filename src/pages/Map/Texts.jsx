import React from "react";
import { Snackbar, IconButton } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import HelpIcon from "@material-ui/icons/Help";
import SidebarGeneral from "./Components/Sidebar";

const SpyDetails = ({ name, pop_est, gdp, continent, subrg }) => {
  return (
    <div className="">
      <h2 className="text-xl p-2">
        Spy Report On: <span className="text-yellow-300">{name}</span>
      </h2>

      <div className="">
        <div>
          <SpyDetailsItem item="Population:" data={pop_est} />
        </div>
        <div>
          <SpyDetailsItem item="GDP (PPP):" data={gdp} />
        </div>
        <div>
          <SpyDetailsItem item="Continent:" data={continent} />
        </div>
        <div>
          {continent !== "South America" && (
            <SpyDetailsItem item="Subregion:" data={subrg} />
          )}
        </div>
      </div>
    </div>
  );
};

const SpyDetailsItem = ({ item, data }) => {
  return (
    <div className="text-white text-sm">
      <span className="text-white">{item}</span> &ensp;{" "}
      <span className="text-white">{data}</span>
    </div>
  );
};

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

//PRE: n >= 0 && n < 100
function stringifyInt(n) {
  let str = n;
  if (n < 10) {
    str = "0" + str;
  }
  return str;
}

function ETA(interval, start) {
  const [seconds, setSeconds] = React.useState(0);

  let resetClock = () => {
    let date = new Date();
    let secondsFromStart = Math.floor(date.getTime() / 1000) - start;
    setSeconds(interval * 60 - (secondsFromStart % (interval * 60)));
  };

  React.useEffect(() => {
    if (seconds >= 0) {
      setTimeout(() => setSeconds(seconds - 1), 1000);
    } else {
      resetClock();
    }
  });

  var hourPart = Math.floor(seconds / 3600) % 24;
  var minutePart = Math.floor(seconds / 60) % 60;
  var secondsPart = seconds % 60;

  var str = stringifyInt(secondsPart);

  if (minutePart !== 0) {
    str = stringifyInt(minutePart) + ":" + str;
    if (hourPart !== 0) {
      str = stringifyInt(hourPart) + ":" + str;
    }
  }
  return str;
}

const Title = ({
  handleCloseHelp,
  handleOpenHelp,
  openHelp,
  user,
  troops,
  interval,
  startTime,
  nextTroops,
}) => {
  return (
    <div>
      <Snackbar
        open={openHelp}
        autoHideDuration={5000}
        onClose={handleCloseHelp}
      >
        <Alert onClose={handleCloseHelp} severity="info">
          This is your control room. Hover above countries to receive encrypted
          data. Click on countries to see your military options.
        </Alert>
      </Snackbar>

      <h1 className="p-4 text-center text-4xl">
        Welcome, Commander{" "}
        <span className="text-yellow-300 text-4xl">{user}</span>!
      </h1>
      <br />

      <h6 className="text-2xl text-center">Stonks: {troops}</h6>

      <h6 className="text-center text-xl text-red-700">
        {nextTroops} stonks arriving in {ETA(interval, startTime)}
      </h6>
      <br />
    </div>
  );
};

const PlayerBox = ({ playerColours, hidden, allegiances }) => {
  return !hidden ? (
    <div>
      {/* <Paper className={classes.players}> */}
      <SidebarGeneral width={300} height={"100vh"} title="Players">
        <br />
        <h1>
          {"Game ID: " +
            document.cookie
              .split("; ")
              .map((s) => s.split("="))
              .filter((arr) => arr[0] === "id")[0][1]}
        </h1>
        <hr className="mx-4 py-2" />
        <h1 className="pb-2 text-4xl">Players</h1>
        {Object.keys(playerColours).map(function (player) {
          var colour = playerColours[allegiances[player]];
          return (
            <div key={player}>
              <p className="py-1 text-center">
                <span style={{ color: colour }}>{player}</span>
              </p>
            </div>
          );
        })}
      </SidebarGeneral>
      {/* </Paper> */}
    </div>
  ) : null;
};
export { SpyDetails, PlayerBox, Title };
