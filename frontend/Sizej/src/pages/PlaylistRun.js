import React, { useState, useEffect } from "react";
import '../styles/tiles.css';
import '../styles/other.css';
import { Link, Navigate } from "react-router-dom";
import Axios from 'axios';
import Moment from 'react-moment';

// import utilities
import { checkForErrorsInRequest } from '../utilities/RequestsUtilities.js';

// import components
import RoundButton from '../components/RoundButton.js';

// assets
import btn_circle_left from '../assets/btn_circle_left.png';
import icon_close from '../assets/icon_close.png';

const reactStringReplace = require('react-string-replace');

class PlaylistRun extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            playlistId: 0,
            playlistSongs: ([{"id_song":0,"playlist_order":1,"title":"songs not loaded","capo":0,"song_key":"null"}]),
            windowHeight: 1000,
            actualSongIndex: 0,
            actualSongObject: {"id_song":0,"title":"Title","author":"Author","content":"[D] [G] [A] [D] [br]\r\nAbove all powers, above all kings","capo":3,"tempo":0,"song_key":"null","shared_note":"","id_team":1,"created_by":1,"date_created":"2021-05-07T14:04:36.000Z","date_edited":"2023-03-02T09:07:58.000Z","original_url":""},
        }
    }

    async componentDidMount(){
        this.loadData();

        this.setState({ redirectTo: null });
        window.addEventListener('resize', this.checkWindowWidth);

        this.checkWindowWidth();
        await new Promise(resolve => setTimeout(resolve, 50));
        this.checkWindowWidth();
    }

    componentWillUnmount() { window.removeEventListener('resize', this.checkWindowWidth); }
    checkWindowWidth = () => { this.setState({ windowHeight: window.innerWidth }); }

    loadData = async () => {
        const { id } = Object.fromEntries(new URLSearchParams(window.location.search));
        if(id != undefined && Number.isInteger(Number(id))){
        //const pathname = window.location.href;
        //var playlist_id = pathname.substring(pathname.lastIndexOf("/")+1);
        //if(playlist_id.includes("?")){ playlist_id = playlist_id.substring(0, playlist_id.indexOf("?")); }

        //if(Number.isInteger(Number(id))){
            this.setState({ playlistId: Number(id) });

            Axios.get('/api/playlists/songs/'+id).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                //alert(JSON.stringify(response.data));
                this.setState({ playlistSongs: response.data.result });
                this.setState({ actualSongIndex: 0 });
                this.loadConcreteWorship(0);

            });
        }
    }

    loadConcreteWorship = async (index) => {
        var songId = this.state.playlistSongs[index].id_song;
        Axios.get('/api/songs/get/'+songId).then(response => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
            this.setState({ actualSongObject: response.data.result[0] })
        });
    }

    nextSong = async () => {
        if((Number(this.state.actualSongIndex)+1) >= this.state.playlistSongs.length)return;
        this.setState({ actualSongIndex: Number(this.state.actualSongIndex)+1 });
        this.loadConcreteWorship(Number(this.state.actualSongIndex)+1);
    }

    prevSong = async () => {
        if((Number(this.state.actualSongIndex)-1) < 0)return;
        this.setState({ actualSongIndex: Number(this.state.actualSongIndex)-1 });
        this.loadConcreteWorship(Number(this.state.actualSongIndex)-1);
    }

    render() {
        if (this.state.redirectTo) {
            return <Navigate to={this.state.redirectTo} />
        }
        var replacedText = this.state.actualSongObject.content;

        replacedText = reactStringReplace(replacedText, "[br]", (match, i) => (
            <br/>
        ));

        replacedText = reactStringReplace(replacedText, /([^[]+(?=]))/g, (match, i) => (
            <span /*key={i}*/ className="fontPoppinsSemiBold15Blue chord" style={{fontSize: (this.state.fontSize+2)}}>{match}</span>
        ));

        replacedText = reactStringReplace(replacedText, "[", (match, i) => (
            null
        ));

        replacedText = reactStringReplace(replacedText, "]", (match, i) => (
            null
        ));

        return(
                <div className="verticalStack flex" style={{height: "calc(100vh)", overflowY: "scroll"}}>

                    <div className="verticalStack">

                        <div className="universalTile">
                            <div>
                                <span className="fontPoppinsRegular13">Capo {this.state.actualSongObject.capo}, Key: {this.state.actualSongObject.song_key}</span>
                            </div>
                        </div>

                        <div className="universalTile">
                            <div>
                                <span className="fontPoppinsRegular13" style={{fontSize: this.state.fontSize}}>
                                    {replacedText}
                                </span>
                            </div>
                        </div>

                        <div style={{height: 100}}></div>

                        <div onClick={() => this.prevSong()}>
                            <img className="playlistRunLeftFloatingButton" src={btn_circle_left} />
                        </div>

                        <div className="playlistRunCenterFloatingButton">
                            <div className="horizontalStack" style={{justifyContent: "center"}}>
                                <Link className="link" to={"/Playlist?id="+this.state.playlistId} >
                                    <RoundButton title={"Ukončit"} icon={icon_close} />
                                </Link>
                            </div>
                        </div>

                        <div onClick={() => this.nextSong()}>
                            <img className="playlistRunRightFloatingButton" src={btn_circle_left} />
                        </div>

                    </div>
                </div>
        );
    }
}

export default PlaylistRun;