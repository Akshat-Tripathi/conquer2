import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { Link } from "react-router-dom";
import Logo from "../../media/conquer2logo.png";
import "./Header.css";

function Header() {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const showButton = () => {
    if (window.innerWidth <= 960) {
      setButton(false);
    } else {
      setButton(true);
    }
  };

  useEffect(() => {
    showButton();
  }, []);

  window.addEventListener("resize", showButton);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <i
            class="fas fa-globe-americas"
            style={{ color: "#ff4520", fontSize: "50px" }}
          />
          &ensp;
          <span style={{ fontFamily: "Lobster", color: "#fff" }}>
            CONQUER 2.0
          </span>
        </Link>
        <div className="menu-icon" onClick={handleClick}>
          <i className={click ? "fas fa-times" : "fas fa-bars"} />
        </div>
        <ul className={click ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link to="/" className="nav-links" onClick={closeMobileMenu}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/forums" className="nav-links" onClick={closeMobileMenu}>
              Forums
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/tutorial"
              className="nav-links"
              onClick={closeMobileMenu}
            >
              Tutorial
            </Link>
          </li>

          <li>
            <Link
              to="/sign-up"
              className="nav-links-mobile"
              onClick={closeMobileMenu}
            >
              Sign up
            </Link>
          </li>
        </ul>
        {button && <Button buttonStyle="btn--outline">SIGN UP</Button>}
      </div>
    </nav>
  );
}

export default Header;
