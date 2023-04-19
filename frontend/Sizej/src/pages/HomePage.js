import React, { useState, useEffect } from "react";
import '../styles/other.css';
import '../styles/pages.css';
import { navigate } from "@reach/router";
import Axios from 'axios';
import Moment from 'react-moment';

// import utilities
import { checkForErrorsInRequest } from '../utilities/RequestsUtilities.js';

// import components
import RoundButton from '../components/RoundButton.js';

class HomePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            team_id: 0,
            team_code: "",
            randomSongId: 0,
            randomSongTitle: "Název",
            nextPlaylistObject: {"id_playlist":0,"notes":"notes","address":"address","date_time":"2023-01-01T00:00:00.000Z","event_name":"event name"},
            nextPlaylistMembers: ([{"id_musician":0,"name":"name","surname":"surname"}]),
            nextPlaylistSongs: ([{"id_song":0,"playlist_order":1,"title":"songs not loaded","capo":0,"song_key":"null"}]),
            notDoneTasks: 0,
        }
    }

    componentDidMount(){
        this.loadData();
    }

    loadData = () => {
        Axios.get('/api/teams/logged').then(response => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
            this.setState({ team_id: response.data.result[0].id_team  });
            if(response.data.result[0].id_team == -1){
                //alert("Byl jste odebrán z vašeho týmu. Vrátit se do vašeho týmu můžete v administraci vašeho účtu zadáním přístupového kódu vašeho týmu.")
            }
        });
        Axios.get('/api/songs/random').then(response => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
            this.setState({ randomSongId: response.data.result[0].id_song  });
            this.setState({ randomSongTitle: response.data.result[0].title  });
        });
        Axios.get('/api/playlists/next').then(response => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
            if(response.data.result.length == 1){
                // playlist found
                this.setState({ nextPlaylistObject: response.data.result[0]  });

                Axios.get('/api/playlists/members/'+response.data.result[0].id_playlist).then(response => {
                    if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                    //alert(JSON.stringify(response.data));
                    this.setState({ nextPlaylistMembers: response.data.result })
                });

                Axios.get('/api/playlists/songs/'+response.data.result[0].id_playlist).then(response => {
                    if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                    //alert(JSON.stringify(response.data));
                    this.setState({ nextPlaylistSongs: response.data.result })
                });
            }

        });
        Axios.get('/api/tasks/get').then(response => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }

            if(response.data.result.length >= 1){
                var notDoneTasks = 0;
                for(let oneRow of response.data.result){
                    if(oneRow.status == "not_done" || oneRow.status == "mistake"){
                        notDoneTasks++;
                    }
                }
                this.setState({ notDoneTasks: notDoneTasks });
            }
        });
    }

    joinTeam = () => {
        if(this.state.team_code == ""){ alert("Je potřeba vyplnit přístupový kód týmu."); return; }

        Axios.post("/api/teams/join", {
            code: this.state.team_code,
        }).then((response) => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
            window.location.reload();
            //alert("Data změněna.");
        });
    }

    openRandomSong = () => {
        if(this.state.randomSongId == 0)return;
        navigate("/Song?id="+this.state.randomSongId);
        window.location.reload();
    }

    openNextPlaylist = () => {
        if(this.state.nextPlaylistObject.id_playlist == 0)return;
        navigate("/Playlist?id="+this.state.nextPlaylistObject.id_playlist);
        window.location.reload();
    }

    openTasksPage = () => {
        navigate("/Tasks");
        window.location.reload();
    }

    render() {
        return (
            <div className="verticalStack flex" style={{height: "calc(100vh - 80px)"}}>

                {this.state.team_id == -1 ?<div className="universalTile" style={{backgroundColor: "#ffcccb"}}>
                    <div className="verticalStack">
                        <span className="fontPoppinsSemiBold15">{"! UPOZORNĚNÍ ! Byl jste odebrán z vašeho týmu !"}</span>
                        <span className="fontPoppinsRegular13Gray">{"Vrátit se do vašeho týmu můžete zadáním přístupového kódu vašeho týmu. Přístupový kód může zjistit vedoucí vašeho týmu v administraci jeho účtu."}</span>

                        <div style={{height: 10}}></div>

                        <div className="verticalStack">
                            <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Kód týmu:*</span>
                            <input className="profileTileInputText" type="text" style={{width: 200}} id="inputFirstName" name="inputFirstName" value={this.state.team_code} onChange={(event) => this.setState({team_code: event.target.value})}/>
                        </div>

                        <div style={{height: 10}}></div>

                        <div className="horizontalStack">
                            <RoundButton title={"Připojit se k týmu"} style={{color: "white", backgroundColor: "#d4daf9"}} onClick={() => this.joinTeam()} whiteText={false} />
                        </div>

                    </div>
                </div> : null }

                <div className="universalTile">
                    <div className="verticalStack">
                        <span className="fontPoppinsSemiBold15">{"Vítejte na domovské stránce"}</span>
                        <span className="fontPoppinsRegular13Gray">{"Ať vám tento web dobře slouží."}</span>
                    </div>
                </div>

                <div className="universalTile">
                    <div className="verticalStack">
                        {this.state.nextPlaylistObject.id_playlist == 0 ? <span className="fontPoppinsSemiBold15">{"Nemáte v budoucnu naplánovaný žádný playlist"}</span> : null }
                        {this.state.nextPlaylistObject.id_playlist != 0 ? <span className="fontPoppinsSemiBold15">{"Nejbližší playlist: "}</span> : null }

                        {this.state.nextPlaylistObject.id_playlist == 0 ? <span className="fontPoppinsRegular13Gray">{"Zde se zobrazí váš nejbližší budoucí playlist."}</span> : null }
                        {this.state.nextPlaylistObject.id_playlist != 0 ? <div className="verticalStack clickable" onClick={() => this.openNextPlaylist()}>
                            <span className="fontPoppinsRegular13DarkGray">{"Datum: "}<span className="fontPoppinsRegular13Gray"><Moment format="D. MMMM YYYY v HH:mm (dddd)">{this.state.nextPlaylistObject.date_time}</Moment></span></span>
                            <span className="fontPoppinsRegular13DarkGray">{"Název události: "}<span className="fontPoppinsRegular13Gray">{this.state.nextPlaylistObject.event_name}</span></span>
                            <span className="fontPoppinsRegular13DarkGray">{"Adresa: "}<span className="fontPoppinsRegular13Gray">{this.state.nextPlaylistObject.address}</span></span>
                            <div style={{height: 10}}></div>
                            <div className="horizontalStack">
                                <span className="fontPoppinsSemiBold13DarkGray" style={{marginRight: 3}}>{"Sestava:"}</span>
                                {this.state.nextPlaylistMembers.map(function (item, index) {
                                    return (
                                        <span className="fontPoppinsRegular13Gray">
                                            {index == 0 ? <span>{" "}{item.name} {item.surname}</span> : null}
                                            {index != 0 ? <span>{", "}{item.name} {item.surname}</span> : null}
                                        </span>
                                    )
                                }.bind(this))}
                            </div>
                            <div style={{height: 10}}></div>
                            <span className="fontPoppinsSemiBold13DarkGray">{"Seznam písní"}</span>
                            <div className="horizontalStack">
                                <table style={{marginLeft: -3}}>
                                {this.state.nextPlaylistSongs.map(function (item, index) {
                                    return (
                                        <tr className="fontPoppinsRegular13DarkGray clickable">
                                            <td>{item.title}</td>
                                            <td style={{paddingLeft: 10, paddingRight: 10}}>{item.capo}{". capo"}</td>
                                            <td>{"tónina: "}{item.song_key}</td>
                                        </tr>
                                    )
                                }.bind(this))}
                                </table>
                            </div>
                        </div> : null }

                    </div>
                </div>

                <div className="universalTile clickable" onClick={() => this.openRandomSong()}>
                    <div className="verticalStack">
                        <span className="fontPoppinsSemiBold15">{"Tip na píseň: "}<span className="fontPoppinsSemiBold15Blue">{this.state.randomSongTitle}</span></span>
                        <span className="fontPoppinsRegular13Gray">{"Co si dnes zkusit zahrát tuto píseň?"}</span>
                    </div>
                </div>

                <div className="universalTile clickable" onClick={() => this.openTasksPage()}>
                    <div className="verticalStack">
                        <span className="fontPoppinsSemiBold15">{"Počet nedokončených úkolů: "}<span className="fontPoppinsSemiBold15Blue">{this.state.notDoneTasks}</span></span>
                        <span className="fontPoppinsRegular13Gray">{"Jsou to úkoly, které byli vytvořeny vámi a nebo sdíleny s vámi."}</span>
                    </div>
                </div>

            </div>
        );
    }
}

export default HomePage;
