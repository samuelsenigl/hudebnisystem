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
import icon_edit from '../assets/icon_edit.png';
import icon_delete from '../assets/icon_delete.png';
import icon_copy from '../assets/icon_copy.png';

class Playlist extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            playlistId: 0,
            playlistObject: {"id_playlist":0,"notes":"notes","address":"address","date_time":"2023-01-01T00:00:00.000Z","event_name":"event name"},
            playlistMembers: ([{"id_musician":0,"name":"name","surname":"surname"}]),
            playlistSongs: ([{"id_song":0,"playlist_order":1,"title":"songs not loaded","capo":0,"song_key":"null"}]),
            windowHeight: 1000,
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

        //if(Number.isInteger(Number(playlist_id))){
            this.setState({ playlistId: Number(id) });

            Axios.get('/api/playlists/get/'+id).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                this.setState({ playlistObject: response.data.result[0] })
            });

            Axios.get('/api/playlists/members/'+id).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                //alert(JSON.stringify(response.data));
                this.setState({ playlistMembers: response.data.result })
            });

            Axios.get('/api/playlists/songs/'+id).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                //alert(JSON.stringify(response.data));
                this.setState({ playlistSongs: response.data.result })
            });
        }
    }

    openSongPage = (id) => {
        this.setState({ redirectTo: "/Song?id="+id });
    }

    deletePlaylist = () => {
        if (window.confirm("Opravdu chcete smazat tento playlist?") == true) {
            Axios.get('/api/playlists/del/'+this.state.playlistId).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                this.setState({ redirectTo: "/Playlists" });
            });
        }
    }

    render() {
        if (this.state.redirectTo) {
            return <Navigate to={this.state.redirectTo} />
        }

        return(
                <div className="verticalStack flex" style={{height: "calc(100vh - 80px)", overflowY: "scroll"}}>

                    <div className="verticalStack">

                        <div className="universalTile">
                            <div className="horizontalStack">
                                <div className="verticalStack flex">
                                    <span className="fontPoppinsSemiBold15">{"Datum: "}<span className="fontPoppinsSemiBold15Blue"><Moment format="D. MMMM YYYY v HH:mm (dddd)">{this.state.playlistObject.date_time}</Moment></span></span>
                                    <div style={{height: 10}}></div>
                                    <span className="fontPoppinsRegular13DarkGray">{"Název události: "}<span className="fontPoppinsRegular13Gray">{this.state.playlistObject.event_name}</span></span>
                                    <div style={{height: 10}}></div>
                                    <span className="fontPoppinsRegular13DarkGray">{"Adresa: "}<span className="fontPoppinsRegular13Gray">{this.state.playlistObject.address}</span></span>
                                    <div style={{height: 10}}></div>
                                    <div className="horizontalStack">
                                        <span className="fontPoppinsRegular13DarkGray" style={{marginRight: 3}}>{"Sestava:"}</span>
                                        {this.state.playlistMembers.map(function (item, index) {
                                            return (
                                                <span className="fontPoppinsRegular13Gray">
                                                    {index == 0 ? <span>{" "}{item.name} {item.surname}</span> : null}
                                                    {index != 0 ? <span>{", "}{item.name} {item.surname}</span> : null}
                                                </span>
                                            )
                                        }.bind(this))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="universalTile">
                            <span className="fontPoppinsSemiBold15">{"Seznam písní"}</span>
                            <div className="horizontalStack">
                                <table style={{marginLeft: -3}}>
                                {this.state.playlistSongs.map(function (item, index) {
                                    return (
                                        <tr className="fontPoppinsRegular13DarkGray">
                                            <td className="clickable" onClick={() => this.openSongPage(item.id_song)}>{item.title}</td>
                                            <td style={{paddingLeft: 10, paddingRight: 10}}>{item.capo}{". capo"}</td>
                                            <td>{"tónina: "}{item.song_key}</td>
                                        </tr>
                                    )
                                }.bind(this))}
                                </table>
                            </div>
                        </div>

                                        {/*<div style={{width: "100%", marginTop: 15}}>
                                            <label className="fontPoppinsSemiBold15Blue clickable" onClick={() => this.openSongPage(1)} style={{border: "1px solid #556EE6", color: "#556EE6", borderRadius: 5, paddingLeft: 5, paddingRight: 5}}>{item.title}</label>
                                        </div>*/}

                        <div className="universalTile">
                            <span className="fontPoppinsSemiBold15">{"Poznámka"}</span>
                            <br/>
                            <span className="fontPoppinsRegular13">{this.state.playlistObject.notes}</span>
                            <div className="horizontalStack" style={{marginTop: 10}}>
                                <div>
                                    <Link className="link" to={"/PlaylistRun?id="+this.state.playlistId} >
                                        <RoundButton title={"Spustit"} icon={icon_edit} />
                                    </Link>
                                </div>
                               <div style={{width: 10}}></div>
                                <div onClick={() => alert("Tato funkce prozatím nefunguje.")}>
                                    <RoundButton title={"Spustit na projektor"} icon={icon_copy} />
                                </div>
                            </div>
                        </div>

                        <div className="universalTile">
                            <div className="horizontalStack" >
                                <div>
                                    <RoundButton title={"Upravit"} icon={icon_edit} onClick={() => this.setState({ redirectTo: "/NewPlaylist?update="+this.state.playlistId })} />
                                </div>
                               <div style={{width: 10}}></div>
                                <div>
                                    <RoundButton title={"Duplikovat"} icon={icon_copy} onClick={() => this.setState({ redirectTo: "/NewPlaylist?duplicate="+this.state.playlistId })} />
                                </div>
                                <div style={{width: 10}}></div>
                                <div>
                                    <RoundButton title={"Smazat"} icon={icon_delete} onClick={() => this.deletePlaylist()} />
                                </div>
                            </div>
                        </div>



                        <div style={{height: 20}}></div>


                    </div>
                </div>
        );
    }
}

export default Playlist;