import React, { useState, useEffect } from "react";
import '../styles/tiles.css';
import '../styles/other.css';
import { Link, Navigate } from "react-router-dom";
import Axios from 'axios';

// import utilities
import { checkForErrorsInRequest } from '../utilities/RequestsUtilities.js';

// import components
import RoundButton from '../components/RoundButton.js';

// assets
import icon_close from '../assets/icon_close.png';

class NewPlaylist extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            redirectTo: null,
            playlistDescr: "",
            playlistName: "Nedělní setkání",
            playlistDate: "2023-02-21",
            playlistAddress: "",
            selectedSongs: [],
            foundSongs: [],
            selectedMusicians: [],
            selectedSong: 0,
            selectedMusician: 0,
            showPopupMembers: false,
            showPopupSongs: false,
            songsList: [{id: 1, title: "10 000 důvodů"},
                           {id: 2, title: "Blíže"},
                           {id: 3, title: "Už nejsem otrokem strachu"}],
            musiciansList: [{id: 1, name: "Samuel Šenigl"},
                           {id: 2, name: "Markétka Šeniglová"},
                           {id: 3, name: "Beny Šenigl"}],
        }
    }

    componentDidMount(){
        this.setState({ redirectTo: null });
        this.loadData();
        this.setState({ playlistDate: this.getTodaysDate() });
    }

    loadData = async () => {
        Axios.get('/api/team/members').then(response => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
            var newTeamMembers = [];
            for(let oneRow of response.data.result){
                var oneObject = oneRow;
                oneObject.id = oneRow.id_musician;
                oneObject.name = oneRow.name+" "+oneRow.surname;
                newTeamMembers.push(oneObject);
            }
            //alert(JSON.stringify(response.data.result.length));
            this.setState({ musiciansList: newTeamMembers })
        });

        // load task I want to duplicate
        const { duplicate } = Object.fromEntries(new URLSearchParams(window.location.search));
        if(duplicate != undefined && Number.isInteger(Number(duplicate))){
            this.setState({ action: "duplicate" });

            Axios.get('/api/playlists/get/'+duplicate).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }

                this.setState({ playlistName: response.data.result[0].event_name });
                this.setState({ playlistAddress: response.data.result[0].address });
                this.setState({ playlistDescr: response.data.result[0].notes });
            });

            Axios.get('/api/playlists/members/'+duplicate).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                //alert(JSON.stringify(response.data));
                var newTeamMembers = [];
                for(let oneRow of response.data.result){
                    var oneObject = {};
                    oneObject.id = oneRow.id_musician;
                    oneObject.name = oneRow.name+" "+oneRow.surname;
                    newTeamMembers.push(oneObject);
                }
                //alert(JSON.stringify(newTeamMembers));
                this.setState({ selectedMusicians: newTeamMembers })
            });

            Axios.get('/api/playlists/songs/'+duplicate).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                //alert(JSON.stringify(response.data));
                this.setState({ selectedSongs: response.data.result })
            });
        }

        // load task I want to update
        const { update } = Object.fromEntries(new URLSearchParams(window.location.search));
        if(update != undefined && Number.isInteger(Number(update))){
            this.setState({ action: "update" });

            Axios.get('/api/playlists/get/'+update).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }

                this.setState({ playlistName: response.data.result[0].event_name });
                this.setState({ playlistAddress: response.data.result[0].address });

                var mydate = new Date(response.data.result[0].date_time);
                const yyyy = mydate.getFullYear();
                let mm = mydate.getMonth() + 1; // Months start at 0!
                let dd = mydate.getDate();

                if (dd < 10) dd = '0' + dd;
                if (mm < 10) mm = '0' + mm;

                const formattedDate = yyyy + '-' + mm + '-' + dd;
                //alert(formattedDate);
                this.setState({ playlistDate: formattedDate });
                this.setState({ playlistDescr: response.data.result[0].notes });
            });

            Axios.get('/api/playlists/members/'+update).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                //alert(JSON.stringify(response.data));
                var newTeamMembers = [];
                for(let oneRow of response.data.result){
                    var oneObject = {};
                    oneObject.id = oneRow.id_musician;
                    oneObject.name = oneRow.name+" "+oneRow.surname;
                    newTeamMembers.push(oneObject);
                }
                //alert(JSON.stringify(newTeamMembers));
                this.setState({ selectedMusicians: newTeamMembers })
            });

            Axios.get('/api/playlists/songs/'+update).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                //alert(JSON.stringify(response.data));
                this.setState({ selectedSongs: response.data.result })
            });
        }
    }

    getTodaysDate = () => {
         var dt = new Date();
         var year  = dt.getFullYear();
         var month = (dt.getMonth() + 1).toString().padStart(2, "0");
         var day   = dt.getDate().toString().padStart(2, "0");
         return(year + '-' + month + '-' + day);
    }

    onSaveNewPlaylist = () => {
        var finalMembersList = [];
        for(let oneRow of this.state.selectedMusicians){finalMembersList.push(oneRow.id)}

        var finalSongsList = [];
        for(let oneRow of this.state.selectedSongs){finalSongsList.push(oneRow.id_song)}

        if(this.state.playlistName == ""){
            alert("Je potřeba vyplnit název playlistu.");
            return
        }
        else if(this.state.playlistDate == ""){
            alert("Je potřeba vyplnit datum playlistu.");
            return
        }
        else if(finalMembersList.length <= 0){
            alert("Je potřeba vybrat alespoň jednoho člena týmu.");
            return
        }
        else if(finalSongsList.length <= 0){
            alert("Je potřeba vybrat alespoň píseň.");
            return
        }

        var url = "/api/playlists/ins";
        const { update } = Object.fromEntries(new URLSearchParams(window.location.search));
        if(update != undefined && Number.isInteger(Number(update))){
            url = "/api/playlists/upd/"+update;
        }

        //alert("Title: "+this.state.playlistName+"\nDate: "+this.state.playlistDate+"\nMembers: "+JSON.stringify(finalMembersList)+"\nSongs: "+JSON.stringify(finalSongsList)+"\nNote: "+this.state.playlistDescr);

        Axios.post(url, {
            title: this.state.playlistName,
            date: this.state.playlistDate,
            members: finalMembersList,
            songs: finalSongsList,
            note: this.state.playlistDescr,
            address: this.state.playlistAddress
        }).then((response) => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }

            const { update } = Object.fromEntries(new URLSearchParams(window.location.search));
            if(update != undefined && Number.isInteger(Number(update))){
                this.setState({ redirectTo: "/Playlist?id="+update });
            }
            else {
                this.setState({ redirectTo: "/Playlists" });
            }
        });
        //this.setState({ redirectTo: "/Playlists" });
    }

    addSongToPlaylist = (id, title) => {
        var arrayOfSelectedSongs = this.state.selectedSongs;
        arrayOfSelectedSongs.push({id_song: id, title: title});

        /*for(let oneRow of this.state.songsList){
            if(oneRow.id == id){
                arrayOfSelectedSongs.push(oneRow);
            }
        }*/

        this.setState({ selectedSongs: arrayOfSelectedSongs });
        this.setState({ showPopupSongs: false});
    }

    addMusicianToPlaylist = (id) => {
        var arrayOfSelectedMusicians = this.state.selectedMusicians;

        for(let oneRow of this.state.musiciansList){
            if(oneRow.id == id){
                // check if already added
                var found = false;
                for(let oneRow of arrayOfSelectedMusicians){
                    if(oneRow.id == id)found = true;
                }
                if(!found)arrayOfSelectedMusicians.push(oneRow);
            }
        }

        this.setState({ selectedMusicians: arrayOfSelectedMusicians });
        this.setState({ showPopupMembers: false});
    }

    deleteSongFromPlaylist = (id_song) => {
        var arrayOfSelectedSongs = [];
        for(let oneRow of this.state.selectedSongs){
            if(oneRow.id_song != id_song){
                arrayOfSelectedSongs.push(oneRow);
            }
        }
        this.setState({ selectedSongs: arrayOfSelectedSongs });
    }

    deleteMusicianFromPlaylist = (id) => {
        var arrayOfSelectedMusicians = [];
        for(let oneRow of this.state.selectedMusicians){
            if(oneRow.id != id){
                arrayOfSelectedMusicians.push(oneRow);
            }
        }
        this.setState({ selectedMusicians: arrayOfSelectedMusicians });
    }

    openSongPage = (id) => {
        this.setState({ redirectTo: "/Song?id="+id });
    }

    searchForSongs = async (searchText) => {
        Axios.get('/api/songs/get?search='+searchText).then(response => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
            this.setState({ foundSongs: response.data.result });
        });
    }

    render() {
        if (this.state.redirectTo) {
            return <Navigate to={this.state.redirectTo} />
        }

        return(
            <div className="verticalStack flex" style={{height: "calc(100vh - 80px)", overflowY: "scroll"}}>

                <div className="verticalStack">

                    <div className="universalTile">
                        <span className="fontPoppinsSemiBold15">{"Nový playlist"}</span>
                        <div style={{height: 10}}></div>

                        <div className="verticalStack" style={{padding: 12, backgroundColor: "#F4F4F8"}}>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Název:*</span>
                                <input className="profileTileInputText" type="text" style={{flex: 1}} id="inputMiddleName" name="inputMiddleName" value={this.state.playlistName} onChange={e => this.setState({ playlistName: e.target.value })} />
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Datum:*</span>
                                <input className="profileTileInputText" type="date" style={{flex: 1}} id="inputMiddleName" name="inputMiddleName" value={this.state.playlistDate} onChange={e => this.setState({ playlistDate: e.target.value })} />
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Adresa:</span>
                                <input className="profileTileInputText" type="text" style={{flex: 1}} id="inputMiddleName" name="inputMiddleName" value={this.state.playlistAddress} onChange={e => this.setState({ playlistAddress: e.target.value })} />
                            </div>

                            {/* MUSICIANS */}

                            <div style={{height: 20}}></div>

                            <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Kdo bude hrát:*</span>

                            <div className="horizontalStack flex" style={{backgroundColor: "white", paddingTop: 10, overflowX: "visible", flexWrap: "wrap"}}>

                                {this.state.selectedMusicians.map(function (item) {
                                    return (
                                        <label className="fontPoppinsRegular13 clickable" onClick={() => this.deleteMusicianFromPlaylist(item.id)} style={{marginLeft: 10, marginBottom: 10, border: "1px solid #556EE6", color: "#556EE6", whiteSpace: "nowrap", borderRadius: 5, paddingLeft: 5, paddingRight: 5}}>{item.name} {"x"}</label>
                                    )
                                }.bind(this))}

                                <div className="universalPopupSelectContainer" style={{marginBottom: 10}}>

                                    <div className="universalPopupSelectVisible horizontalStack">
                                        <label className="fontPoppinsRegular13 clickable" style={{marginLeft: 10, border: "1px solid #ff6600", color: "#ff6600", borderRadius: 5, paddingLeft: 5, paddingRight: 5, whiteSpace: "nowrap"}} onClick={() => this.setState({ showPopupMembers: !this.state.showPopupMembers })}>{"+ Přidat člena"}</label>
                                    </div>

                                    <div className="universalPopupSelectHidden" style={{display: this.state.showPopupMembers ? "" : "none", marginTop: -37}}>
                                        <div className="verticalStack">

                                            {this.state.musiciansList.map(function (item, index) {
                                                return (
                                                    <div>
                                                        {index != 0 ? <div style={{height: 1, backgroundColor: "#EFF2F7", marginLeft: -15, marginRight: -15, marginTop: 5, marginBottom: 5}}></div> : null}
                                                        <div style={{height: 7}}></div>
                                                        <span className="fontPoppinsRegular13 clickable onHoverToOrange" onClick={() => this.addMusicianToPlaylist(item.id)}>{item.name}</span>
                                                        <div style={{height: 7}}></div>
                                                    </div>
                                                )
                                            }.bind(this))}

                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{height: 20}}></div>



                            {/* SONGS */}

                            <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Vybrané písně:*</span>

                            <div className="verticalStack flex" style={{backgroundColor: "white", paddingTop: 10, overflowX: "visible"}}>

                                {this.state.selectedSongs.map(function (item) {
                                    return (
                                        <div style={{marginBottom: 10}}>
                                        <label className="fontPoppinsRegular13 clickable" onClick={() => this.deleteSongFromPlaylist(item.id_song)} style={{marginLeft: 10, marginRight: 10, border: "1px solid #556EE6", color: "#556EE6", whiteSpace: "nowrap", borderRadius: 5, paddingLeft: 5, paddingRight: 5}}>{item.title} {"x"}</label>
                                        </div>
                                    )
                                }.bind(this))}

                                <div className="universalPopupSelectContainer" style={{marginBottom: 10}}>

                                    <div className="universalPopupSelectVisible horizontalStack">
                                        <label className="fontPoppinsRegular13 clickable" style={{marginLeft: 10, border: "1px solid #ff6600", color: "#ff6600", borderRadius: 5, paddingLeft: 5, paddingRight: 5, whiteSpace: "nowrap"}} onClick={() => this.setState({ showPopupSongs: !this.state.showPopupSongs })}>{"+ Přidat píseň"}</label>
                                    </div>

                                    <div className="universalPopupSelectHidden" style={{display: this.state.showPopupSongs ? "" : "none", marginTop: -37}}>
                                        <div className="verticalStack">
                                            <input className="fontPoppinsRegular13" type="text" id="contactId" name="contactId" autocomplete="off" placeholder="Napiš název písně..." onChange={e => {this.searchForSongs(e.target.value);}} style={{marginTop: 5, marginBottom: 5, border: "0px solid black"}}/>

                                            {this.state.foundSongs.map(function (item, index) {
                                                return (
                                                    <div>
                                                        {index != 0 ? <div style={{height: 1, backgroundColor: "#EFF2F7", marginLeft: -15, marginRight: -15, marginTop: 5, marginBottom: 5}}></div> : null}
                                                        <div style={{height: 7}}></div>
                                                        <span className="fontPoppinsRegular13 clickable onHoverToOrange" onClick={() => this.addSongToPlaylist(item.id_song, item.title)}>{item.title}</span>
                                                        <div style={{height: 7}}></div>
                                                    </div>
                                                )
                                            }.bind(this))}

                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{height: 20}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Poznámka:</span>
                                <textarea className="" type="text" style={{flex: 1, border: 0, resize: "none"}} rows={3} name="obsah" placeholder="" value={this.state.playlistDescr} onChange={e => this.setState({ playlistDescr: e.target.value })}></textarea>
                            </div>

                            <div style={{height: 20}}></div>

                            <div className="horizontalStack">
                                <RoundButton title={"Uložit nový playlist"} style={{color: "white", backgroundColor: "#ff6600"}} onClick={this.onSaveNewPlaylist} whiteText={true} />
                            </div>
                        </div>
                    </div>

                    <div style={{height: 20}}></div>
                </div>
            </div>
        );
    }
}

export default NewPlaylist;