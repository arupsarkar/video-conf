import React, { Component } from "react";
import AppBar from 'material-ui/AppBar';
import { render } from "react-dom";
import "./styles/styles.css";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from "react-tap-event-plugin";
import VideoComponent from "./VideoComponent";

injectTapEventPlugin();

let dom = document.getElementById("app");
render(
    <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
            <div>
            <AppBar title="Vonn Video Conference" />
            <VideoComponent />
            </div>
    </MuiThemeProvider>
    ,
    dom
);