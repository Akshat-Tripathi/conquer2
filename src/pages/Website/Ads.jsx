import React from "react";
import CompatibleBrowsers from "../../media/CompatibleBrowsers.jpg";
import AllBrowsers from "../../media/AllDevices.png";
import "./Ads.css";

function Ads() {
  return (
    // <div className="self-ads">
    // 	<div className="self-ads-grid">
    // 		<div className="all-browsers" />
    // 		<div className="compatible-devices" />

    // 	</div>
    // </div>

    <div className="ads">
      <div className="ads-title">
        <h1 className="text-4xl text-yellow-400">Supported Browsers</h1>
        <br />
        <p className="text-white text-sm">
          Now play on any browser anytime, anywhere, without any hassle
        </p>
      </div>
      <div className="ads-wrapper">
        <div>
          <i class="fab fa-chrome fa-spin icon-browser" />
          <h2 className="p-2 text-xl font-bold">Chrome</h2>
        </div>
        <div>
          <i class="fab fa-safari fa-spin icon-browser" />
          <h2 className="p-2 text-xl font-bold">Safari</h2>
        </div>
        <div>
          <i class="fab fa-firefox fa-spin icon-browser" />
          <h2 className="p-2 text-xl font-bold">Firefox</h2>
        </div>
        <div>
          <i class="fab fa-edge fa-spin icon-browser" />
          <h2 className="p-2 text-xl font-bold">Edge</h2>
        </div>
      </div>
    </div>
  );
}

export default Ads;
