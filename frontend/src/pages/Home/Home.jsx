import React, { Component } from "react";
import {
  Typography,
  Box,
  makeStyles,
  Container,
  Grid,
  Link,
} from "@material-ui/core";
import "./Home.css";
import StartGameBox from "./StartGameBox";
import Video from "./Video.jsx";

function Title() {
  const useStyles = makeStyles({
    root: {
      background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
      borderRadius: 5,
      border: 1,
      boxShadow: "0 5px 7px 5px rgba(255, 105, 135, .3)",
    },
  });

  const classes = useStyles();

  return (
    <Container
      maxWidthLg
      elevation={3}
      classes={{ root: classes.root }}
      styles={{ paddingTop: "0%", paddingLeft: "0%", paddingRight: "0%" }}
    >
      {/* <div className="title-head"> */}
      <Box align="center" color="white">
        <Typography variant="h2">CONQUER V2.0</Typography>
        <Box color="white" align="center">
          {/* <Typography variant="subtitle1" align="center">
            by Imperium Games
          </Typography> */}
        </Box>
      </Box>
      {/* </div> */}
    </Container>
  );
}

function PermaFooter() {
  const useStyles = makeStyles((theme) => ({
    footermain: {
      paddingBottom: "0%",
    },
    footer: {
      backgroundColor: theme.palette.background.paper,
      borderRadius: 5,
      border: 1,
    },
  }));

  const classes = useStyles();

  return (
    <Container className={classes.footer} position="fixed">
      <Box mb="0%">
        {/* <Typography variant="h6" align="center" gutterBottom>
        Conquer V2.0
      </Typography> */}
        <Typography
          variant="subtitle1"
          align="center"
          color="textSecondary"
          component="p"
        >
          Developed by Imperium Games
        </Typography>
        <Copyright />
      </Box>
    </Container>
  );
}

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

class Home extends Component {
  render() {
    return (
      <div className="home-page">
        <Video />
        <Title />
        <StartGameBox />
        {/* <Credits /> */}
        <PermaFooter />
      </div>
    );
  }
}

export default Home;
