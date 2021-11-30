import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { Link, useHistory } from "react-router-dom";
import Logo from "../../media/conquer2logo.png";
import "./Header.css";

function Header() {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);

  const history = useHistory();

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

  const goToSignUpPage = () => {
    history.push("/signup")
  }

  return (
    <nav className="navbar min-h-full flex justify-center align-middle text-xl whitespace-nowrap">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <i
            className="fas fa-globe-americas text-orange-600"
            style={{ color: "#ff4520", fontSize: "50px" }}
          />
          &ensp;
          <h6 style={{ fontFamily: "Lobster"}} className="text-white whitespace-nowrap">
            CONQUER 2.0
          </h6>
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
              to="/signup"
              className="nav-links-mobile"
              onClick={closeMobileMenu}
            >
              Sign up
            </Link>
          </li>
        </ul>
        {button && <Button buttonStyle="btn--outline" onClick={goToSignUpPage}>SIGN UP</Button>}
      </div>
    </nav>
  );
}

export default Header;
