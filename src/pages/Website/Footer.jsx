import React, { useRef, useState } from "react";
import "./Footer.css";
import { Button } from "./Button";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

function Footer() {
  const emailEl = useRef(null);
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("");

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const SnackbarToShow = () => {
    if (open) {
      return (
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={snackbarType}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      );
    }
    return <div />;
  };

  const handleSubscriptionRequest = (e) => {
    e.preventDefault();
    db.collection("Subscriptions")
      .doc(emailEl.current.value)
      .set({
        email: emailEl.current.value,
        Date: new Date(),
      })
      .then((_) => {
        setSnackbarType("success");
        setSnackbarMessage("Successfully Subscribed!");
        setOpen(true);
      })
      .catch((err) => {
        setSnackbarType("error");
        setSnackbarMessage("Error! " + snackbarMessage);
        setOpen(true);
      });
  };

  return (
    <div className="footer-container">
      <section className="footer-subscription">
        <div className="form">
          <p className="footer-subscription-heading" style={{ color: "#fff" }}>
            Stay updated as our conquest proceeds!
          </p>
          <p className="footer-subscription-text" style={{ color: "#fff" }}>
            You can unsubscribe at any time{" "}
            <small className="text-xs"> (lol not really)</small>
          </p>
          <div className="input-areas">
            {SnackbarToShow()}
            <form onSubmit={handleSubscriptionRequest}>
              <input
                className="footer-input"
                name="email"
                type="email"
                placeholder="Your Email"
                ref={emailEl}
              />
              <Button
                buttonStyle="btn--outline"
                style={{ color: "#fff" }}
                onClick={handleSubscriptionRequest}
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        <div className="discord-widget">
          <iframe
            src="https://discordapp.com/widget?id=655196234247569438&theme=dark"
            width="350"
            height="500"
            allowtransparency="true"
            frameborder="0"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          />
        </div>
      </section>

      <section class="social-media">
        <div class="social-media-wrap">
          <div class="footer-logo">
            <Link to="/" className="social-logo">
              <i
                class="fas fa-globe-americas"
                style={{ color: "#ff4520", fontSize: "50px" }}
              />
              &ensp;
              <span style={{ fontFamily: "Lobster", color: "#fff" }}>
                CONQUER 2.0
              </span>
            </Link>
          </div>
          <small class="website-rights">
            By Imperium Games &copy; {new Date().getFullYear()}
          </small>
          <div class="social-icons">
            <Link
              class="social-icon-link discord"
              to="/"
              target="_blank"
              aria-label="Discord"
            >
              <i class="fab fa-discord icon" />
            </Link>
            <Link
              class="social-icon-link facebook"
              to="/"
              target="_blank"
              aria-label="Facebook"
            >
              <i class="fab fa-facebook-f icon" />
            </Link>
            <Link
              class="social-icon-link youtube"
              to="/"
              target="_blank"
              aria-label="Youtube"
            >
              <i class="fab fa-youtube icon" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Footer;
