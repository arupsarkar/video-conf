import React, { Component } from "react";
import Video from "twilio-video";
import axios from "axios";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
import { Card, CardHeader, CardText } from "material-ui/Card";

export default class VideoComponent extends Component {
    constructor(props) {
        super();
        this.state = {
            identity: null /* Will hold the fake name assigned to the client. The name is generated by faker on the server */,
            roomName: "" /* Will store the room name */,
            roomNameErr: false /* Track error for room name TextField. This will    enable us to show an error message when this variable is true */,
            previewTracks: null,
            localMediaAvailable: false /* Represents the availability of a LocalAudioTrack(microphone) and a LocalVideoTrack(camera) */,
            hasJoinedRoom: false,
            activeRoom: null, // Track the current active room
        };
        this.joinRoom = this.joinRoom.bind(this);
        this.handleRoomNameChange = this.handleRoomNameChange.bind(this);
        this.roomJoined = this.roomJoined.bind(this);
        this.leaveRoom = this.leaveRoom.bind(this);
        this.detachTracks = this.detachTracks.bind(this);
        this.detachParticipantTracks = this.detachParticipantTracks.bind(this);
    }

    componentDidMount() {
        axios.get("/token").then((results) => {
            /*
        Make an API call to get the token and identity(fake name) and  update the corresponding state variables.
            */
            const { identity, token } = results.data;
            this.setState({ identity, token });
            console.log(new Date(), "results : " + JSON.stringify(results));
        });
    }

    handleRoomNameChange(e) {
        /* Fetch room name from text field and update state */
        let roomName = e.target.value;
        this.setState({ roomName });
    }
    joinRoom() {
        /* 
     Show an error message on room name text field if user tries         joining a room without providing a room name. This is enabled by setting `roomNameErr` to true
       */
        if (!this.state.roomName.trim()) {
            this.setState({ roomNameErr: true });
            return;
        }

        console.log("Joining room '" + this.state.roomName + "'...");
        let connectOptions = {
            name: this.state.roomName,
        };

        if (this.state.previewTracks) {
            connectOptions.tracks = this.state.previewTracks;
        }


        Video.connect(this.state.token, connectOptions).then(
            this.roomJoined,
            (error) => {
                alert("Could not connect to Twilio: " + error.message);
            }
        );
    }

    // Get the Participant's Tracks.
    getTracks(participant) {
        return Array.from(participant.tracks.values())
            .filter(function (publication) {
                return publication.track;
            })
            .map(function (publication) {
                return publication.track;
            });
    }

    // Attach the Tracks to the DOM.
    attachTracks(tracks, container) {
        tracks.forEach((track) => {
            console.log(new Date(), "---> attachTracks : " + JSON.stringify(track));
            container.appendChild(track.attach());
        });
    }

    // Attach the Participant's Tracks to the DOM.
    attachParticipantTracks(participant, container) {
        //let tracks = Array.from(participant.tracks.values());
        let tracks = this.getTracks(participant);
        console.log(new Date(), "---> attachTracks : " + tracks);
        this.attachTracks(tracks, container);
    }

    roomJoined(room) {
        // Called when a participant joins a room
        console.log("Joined as '" + this.state.identity + "'");
        this.setState({
            activeRoom: room,
            localMediaAvailable: true,
            hasJoinedRoom: true, // Removes ‘Join Room’ button and shows ‘Leave Room’
        });

        // Attach LocalParticipant's tracks to the DOM, if not already attached.
        let previewContainer = this.refs.localMedia;

        if (!previewContainer.querySelector("video")) {
            console.log(new Date(), ' preview container false ' + previewContainer.querySelector("video"));
            this.attachParticipantTracks(room.localParticipant, previewContainer);
        } else {
            console.log(new Date(), ' preview container false true ' + previewContainer.querySelector("video"));
        }
        // ... more event listeners

        // Attach the Tracks of the room's participants.
        room.participants.forEach((participant) => {
            console.log("Already in Room: '" + participant.identity + "'");
            console.log(new Date(), " room.participants " + participant);
            let previewContainer = this.refs.remoteMedia;
            this.attachParticipantTracks(participant, previewContainer);
        });

        // Participant joining room
        room.on("participantConnected", participant => {
            console.log(`Participant "${participant.identity}" connected`);
            console.log(new Date(), ' participantConnected : ' + participant);

            participant.tracks.forEach(track => {
                console.log(new Date(), 'participantConnected:track' + track);
                let previewContainer = this.refs.remoteMedia;
                this.attachTracks(track, previewContainer);                
                //document.getElementById('remote-media-div').appendChild(track.attach());
              });            

        });

        // Attach participant’s tracks to DOM when they add a track
        room.on("trackAdded", (track, participant) => {
            console.log(new Date(), " trackAdded track: " + track);
            console.log(new Date() + " trackAdded participant: " + participant);
            let previewContainer = this.refs.remoteMedia;
            this.attachTracks([track], previewContainer);
        });

        // Detach participant’s track from DOM when they remove a track.
        room.on("trackRemoved", (track, participant) => {
            console.log(participant.identity + " removed track: " + track.kind);
            console.log(new Date(), ' trackRemoved: track - ' + track);
            console.log(new Date(), ' trackRemoved: participant - ' + participant);
            this.detachTracks([track]);
        });

        // Detach all participant’s track when they leave a room.
        room.on("participantDisconnected", (participant) => {
            console.log("Participant '" + participant.identity + "' left the room");
            this.detachParticipantTracks(participant);
        });

        room.on("disconnected", () => {
            if (this.state.previewTracks) {
                this.state.previewTracks.forEach((track) => {
                    track.stop();
                });
            }
            this.detachParticipantTracks(room.localParticipant);
            room.participants.forEach(this.detachParticipantTracks);
            this.state.activeRoom = null;
            this.setState({ hasJoinedRoom: false, localMediaAvailable: false });
        });
    }

    leaveRoom() {
        this.state.activeRoom.disconnect();
        this.setState({ hasJoinedRoom: false, localMediaAvailable: false });
    }

    detachTracks(tracks) {
        tracks.forEach((track) => {
            track.detach().forEach((detachedElement) => {
                detachedElement.remove();
            });
        });
    }

    detachParticipantTracks(participant) {
        //var tracks = Array.from(participant.tracks.values());
        let tracks = this.getTracks(participant);
        console.log(new Date(), " detach participants tracks " + tracks);
        this.detachTracks(tracks);
    }

    render() {
        /* 
       Controls showing of the local track
       Only show video track after user has joined a room else show nothing 
      */
        let showLocalTrack = this.state.localMediaAvailable ? (
            <div className="flex-item">
                <div ref="localMedia" />
            </div>
        ) : (
                ""
            );
        /*
       Controls showing of ‘Join Room’ or ‘Leave Room’ button.  
       Hide 'Join Room' button if user has already joined a room otherwise 
       show `Leave Room` button.
      */
        let joinOrLeaveRoomButton = this.state.hasJoinedRoom ? (
            <RaisedButton
                label="Leave Room"
                secondary={true}
                onClick={this.leaveRoom}
            />
        ) : (
                <RaisedButton label="Join Room" primary={true} onClick={this.joinRoom} />
            );
        return (
            <Card>
                <CardText>
                    <div className="flex-container">
                        {showLocalTrack}
                        <div className="flex-item">
                            <TextField
                                hintText="Room Name"
                                onChange={this.handleRoomNameChange}
                                errorText={
                                    this.state.roomNameErr ? "Room Name is required" : undefined
                                }
                            />
                            <br />
                            {joinOrLeaveRoomButton}
                        </div>
                        <div className="flex-item" ref="remoteMedia" id="remote-media">
                        </div>
                    </div>
                </CardText>
            </Card>
        );
    }
}
