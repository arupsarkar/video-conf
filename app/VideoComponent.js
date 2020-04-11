import React, { Component } from 'react';
import Video from 'twilio-video';
import axios from 'axios';

export default class VideoComponent extends Component {
 constructor(props) {
   super();
   this.state = {
    identity: null,  /* Will hold the fake name assigned to the client. The name is generated by faker on the server */
    roomName: '',    /* Will store the room name */
    roomNameErr: false,  /* Track error for room name TextField. This will    enable us to show an error message when this variable is true */
    previewTracks: null,
    localMediaAvailable: false, /* Represents the availability of a LocalAudioTrack(microphone) and a LocalVideoTrack(camera) */
    hasJoinedRoom: false,
    activeRoom: null // Track the current active room
    };   
 }

 componentDidMount() {
    axios.get('/token').then(results => {
      /*
  Make an API call to get the token and identity(fake name) and  update the corresponding state variables.
      */
      const { identity, token } = results.data;
      this.setState({ identity, token });
      console.log(new Date(), 'results : ' + JSON.stringify(results));
    });
  }

 render() {
   return (
     <div>Video Component</div>
   );
 }
}