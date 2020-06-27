import React, { Component } from "react";
import mp3_file from "./intro.mp3";

const AudioPlayer = function (props) {
  return <audio src={mp3_file} controls autoPlay />;
};
export default AudioPlayer;
