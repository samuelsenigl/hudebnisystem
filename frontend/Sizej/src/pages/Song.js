import React, { useState, useEffect } from "react";
import '../styles/tiles.css';
import '../styles/other.css';
import { Link, Navigate } from "react-router-dom";
import { navigate } from "@reach/router";
import Axios from 'axios';

// import utilities
import { checkForErrorsInRequest } from '../utilities/RequestsUtilities.js';

// import components
import RoundButton from '../components/RoundButton.js';

// assets
import icon_edit from '../assets/icon_edit.png';
import icon_print from '../assets/icon_print.png';
import icon_expand from '../assets/icon_expand.png';
import icon_delete from '../assets/icon_delete.png';
import icon_add from '../assets/icon_add.png';

const reactStringReplace = require('react-string-replace');

class Song extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            redirectTo: null,
            fontSize: Number(localStorage.getItem("savedFontSize")) || 13,
            transpose: 0,
            songId: 0,
            songObject: {"id_song":0,"title":"Title","author":"Author","content":"[D] [G] [A] [D] [br]\r\nAbove all powers, above all kings","capo":3,"tempo":0,"song_key":"null","shared_note":"","id_team":1,"created_by":1,"date_created":"2021-05-07T14:04:36.000Z","date_edited":"2023-03-02T09:07:58.000Z","original_url":""},
            songTags: ([{"id_tag":"tags not loaded"}]),
            songPrivateNotes: ([{"id_note":0,"id_song":0,"is_musician":0,"content":"private notes not loaded","date_created":"2023-01-01T00:00:00.000Z","date_edited":"2023-01-01T00:00:00.000Z"}]),
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
        //var song_id = pathname.substring(pathname.lastIndexOf("/")+1);
        //if(song_id.includes("?")){ song_id = song_id.substring(0, song_id.indexOf("?")); }

        //if(Number.isInteger(Number(song_id))){
            this.setState({ songId: Number(id) });

            Axios.get('/api/songs/get/'+id).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                this.setState({ songObject: response.data.result[0] })
            });

            Axios.get('/api/tags/get/'+id).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                this.setState({ songTags: response.data.result })
            });

            this.loadCustomNotes();
        }
        await new Promise(resolve => setTimeout(resolve, 300));
        this.runTranspose();
    }

    loadCustomNotes = () => {
        const { id } = Object.fromEntries(new URLSearchParams(window.location.search));
        if(id != undefined && Number.isInteger(Number(id))){
            this.setState({ songId: Number(id) });

            Axios.get('/api/notes/get/'+id).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                //alert(JSON.stringify(response.data));
                this.setState({ songPrivateNotes: response.data.result })
            });
        }
    }

    runTranspose = async () => {
        const { transpose } = await Object.fromEntries(new URLSearchParams(window.location.search));
        var transposeNumber = 0;
        if(transpose){
            transposeNumber = Number(transpose);
        }
        this.transposeMethod(transposeNumber);
    }

    transposeMethod = async (value) => {
        var transposeArray = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","H"];
        while(value < 0){
            value = value + transposeArray.length;
        }
        let elements = await document.querySelectorAll('.chord');

        for(var i=elements.length; i--;){

            // here I am transposing one single chord
            var chord = elements[i].textContent;
            var isMol = false;
            if(chord.includes("m")){
                chord = chord.replace("m", "");
                isMol = true;
            }
            var id = 0;
            for(let oneRow of transposeArray){
                if(oneRow == chord){
                    let newId = (id + value) % transposeArray.length;
                    elements[i].textContent = transposeArray[newId]+(isMol ? "m" : "");
                }
                id++;
            }

        }

    }

    transposeUp = async () => {
        const { transpose } = await Object.fromEntries(new URLSearchParams(window.location.search));
        var transposeNumber = 0;
        var newTranspose = 1;
        if(transpose){
            newTranspose = Number(transpose)+1;
        }
        navigate("/Song?id="+this.state.songId+"&transpose="+newTranspose);
        window.location.reload();
    }

    transposeDown = async () => {
        const { transpose } = await Object.fromEntries(new URLSearchParams(window.location.search));
        var transposeNumber = 0;
        var newTranspose = -1;
        if(transpose){
            newTranspose = Number(transpose)-1;
        }
        navigate("/Song?id="+this.state.songId+"&transpose="+newTranspose);
        window.location.reload();
    }

    textSizeUp = async () => {
        await localStorage.setItem("savedFontSize", Number(this.state.fontSize)+2);
        window.location.reload();
    }

    textSizeDown = async () => {
        localStorage.setItem("savedFontSize", Number(this.state.fontSize)-2);
        window.location.reload();
    }

    createCustomNote = async () => {
        const enteredContent = prompt('Napište obsah poznámky:');
        if(enteredContent.length <= 0){ alert("Poznámka nebyla vyplněna."); return;}

        await Axios.post("/api/notes/ins", {
            songId: this.state.songId,
            content: enteredContent,
        }).then((response) => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
        });
        this.loadCustomNotes();
        //window.location.reload();
    }

    updateCustomNote = async (noteId, noteContent) => {
        const enteredContent = prompt('Napište obsah poznámky:', noteContent);
        if(enteredContent.length <= 0){ alert("Poznámka nebyla vyplněna."); return;}

        await Axios.post("/api/notes/upd/"+noteId, {
            content: enteredContent,
        }).then((response) => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
        });
        this.loadCustomNotes();
        //window.location.reload();
    }

    deleteCustomNote = (noteId) => {
        if (window.confirm("Opravdu chcete smazat tuto poznámku?") == true) {
            Axios.get('/api/notes/del/'+noteId).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                this.loadCustomNotes();
                //window.location.reload();
            });
        }
    }

    deleteSong = () => {
        if (window.confirm("Opravdu chcete smazat tuto píseň?") == true) {
            var firstNum = Math.floor(Math.random() * (20 - 1) + 1);
            var secondNum = Math.floor(Math.random() * (20 - 1) + 1);
            var result = firstNum+secondNum;

            const enteredResult = prompt('!TATO AKCE NELZE VZÍT ZPĚT!\nOpravdu víte jistě, že chcete smazat tuto píseň?\nPro potvrzení napište výsledek následujícího příkladu.\nPříklad: '+firstNum+" + "+secondNum);
            if(result+"" === enteredResult){
                Axios.get('/api/songs/del/'+this.state.songId).then(response => {
                    if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                    this.setState({ redirectTo: "/Songs" });
                });
            }
            else {
                alert("Výsledek byl zadán špatně. Píseň nebyla smazána.");
            }

        }
    }

    render() {
        if (this.state.redirectTo) {
            return <Navigate to={this.state.redirectTo} />
        }
        var replacedText = this.state.songObject.content;

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
                <div className="verticalStack flex" style={{height: "calc(100vh - 80px)", overflowY: "scroll"}}>

                    <div className="verticalStack">

                        <div className="universalTile">
                            <div className="verticalStack">
                                <span className="fontPoppinsSemiBold15">{"Název: "}<span className="fontPoppinsSemiBold15Blue">{this.state.songObject.title}</span></span>
                                <div style={{height: 10}}></div>
                                <span className="fontPoppinsRegular13DarkGray">{"Autor: "}<span className="fontPoppinsRegular13Gray">{this.state.songObject.author != "" ? this.state.songObject.author : "-"}</span></span>
                                <span className="fontPoppinsRegular13DarkGray">{"Capo: "}<span className="fontPoppinsRegular13Gray">{this.state.songObject.capo}</span></span>
                            </div>
                        </div>

                        <div className="universalTile">
                            <div>
                                <span className="fontPoppinsRegular13" style={{fontSize: this.state.fontSize}}>
                                    {replacedText}
                                </span>
                            </div>
                        </div>

                        <div className="universalTile">
                            <div className="verticalStack">
                                <div className={this.state.windowHeight >= 900 ? "horizontalStack" : "verticalStack"}>

                                    <div className="horizontalStack">
                                        <RoundButton title={"Upravit"} icon={icon_edit} onClick={() => this.setState({ redirectTo: "/NewSong?update="+this.state.songId })} />


                                        <div style={{width: 10}}></div>

                                        <div className="circleButtonTransposeContainer clickable" style={{backgroundColor: "#d4daf9"}} onClick={() => this.transposeUp()}>
                                            <img className="circleButton" style={{width: "10.5px", height: "16px", transform: "rotate(270deg)"}} src={icon_expand}/>
                                        </div>

                                        <div style={{width: 10}}></div>

                                        <div className="circleButtonTransposeContainer clickable" style={{backgroundColor: "#d4daf9"}} onClick={() => this.transposeDown()}>
                                            <img className="circleButton" style={{width: "10.5px", height: "16px", transform: "rotate(90deg)"}} src={icon_expand}/>
                                        </div>
                                    </div>

                                    <div style={{width: 10, height: 10}}></div>

                                    <div className="horizontalStack">
                                        <RoundButton title={"Tisk"} icon={icon_print} onClick={() => alert("Tato funkce není zatím dostupná.")} />

                                        <div style={{width: 10}}></div>

                                        <RoundButton title={"+"} onClick={() => this.textSizeUp()} />

                                        <div style={{width: 10}}></div>

                                        <RoundButton title={"-"} onClick={() => this.textSizeDown()} />
                                    </div>

                                    <div style={{width: 10, height: 10}}></div>

                                    <div className="horizontalStack">
                                        <RoundButton title={"Smazat"} onClick={() => this.deleteSong()} />
                                    </div>

                                    <div style={{width: 10}}></div>
                                </div>
                                <div style={{height: 10}}></div>
                                <span className="fontPoppinsSemiBold15">{"Více informací o písni"}</span>
                                <div style={{height: 10}}></div>
                                <span className="fontPoppinsRegular13DarkGray">{"Tempo: "}<span className="fontPoppinsRegular13Gray">{this.state.songObject.tempo}{" bpm"}</span></span>
                                <span className="fontPoppinsRegular13DarkGray">{"Tónina: "}<span className="fontPoppinsRegular13Gray">{this.state.songObject.song_key}</span></span>
                                <br/>
                                <span className="fontPoppinsRegular13DarkGray">{"Společné poznámky: "}</span>
                                <span className="fontPoppinsRegular13Gray">{this.state.songObject.shared_note != "" ? this.state.songObject.shared_note : "-"}</span>
                                <br/>
                                <div className="horizontalStack">
                                    <span className="fontPoppinsRegular13DarkGray">{"Tagy: "}</span>
                                    {this.state.songTags.map(function (item) {
                                        return (
                                            <label className="fontPoppinsRegular13" style={{marginLeft: 10, marginBottom: 0, border: "1px solid #556EE6", color: "#556EE6", whiteSpace: "nowrap", borderRadius: 5, paddingLeft: 5, paddingRight: 5}}>{item.id_tag}</label>
                                        )
                                    }.bind(this))}
                                </div>
                                <br/>
                                <span className="fontPoppinsRegular13DarkGray">{"Originální video: "}</span>

                                <div className="embedVideo">
                                    {this.state.songObject.original_url.includes("https://www.youtube.com/embed") ?
                                        <iframe
                                          src={this.state.songObject.original_url}
                                          frameBorder="0"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                          title="Embedded youtube"
                                        />
                                    : <span className="fontPoppinsRegular13Gray">{"Pro tuto píseň jste neuložil odkaz na Youtube."}</span>}
                                  </div>
                            </div>
                        </div>

                        <div className="universalTile">

                            <div className="horizontalStack">

                                <div className="verticalStack flex" style={{display: "table", tableLayout: "fixed", width: "100%"}}>
                                    <span className="fontPoppinsSemiBold15">{"Moje poznámky"}</span>
                                    <br/>
                                    <span className="fontPoppinsRegular13Gray">{"Tyto poznámky vidíte pouze vy."}</span>
                                </div>

                                <div style={{width: "20px"}}></div>

                                <div className="circleButtonTransposeContainer clickable" style={{backgroundColor: "#d4daf9"}} onClick={() => this.createCustomNote()}>
                                    <img className="circleButton" style={{height: "20px"}} src={icon_add}/>
                                </div>

                            </div>

                            <div className="verticalStack">

                                {this.state.songPrivateNotes.map(function (item) {
                                    return (
                                        <div className="universalTile" style={{backgroundColor: "#eeeeee", boxShadow: "0px 10px 20px #12263F0D", minHeight: 50}}>
                                            <div className="horizontalStack">

                                                <div className="verticalStack flex">
                                                    <span className="fontPoppinsRegular13">{item.content}</span>
                                                </div>

                                                <div style={{width: 10}}></div>

                                                <div className="circleButtonTransposeContainer clickable" style={{backgroundColor: "#d4daf9"}} onClick={() => this.updateCustomNote(item.id_note,item.content)}>
                                                    <img className="circleButton" style={{height: "16px"}} src={icon_edit}/>
                                                </div>

                                                <div style={{width: 10}}></div>

                                                <div className="circleButtonTransposeContainer clickable" style={{backgroundColor: "#d4daf9"}} onClick={() => this.deleteCustomNote(item.id_note)}>
                                                    <img className="circleButton" style={{height: "16px"}} src={icon_delete}/>
                                                </div>

                                            </div>
                                        </div>
                                    )
                                }.bind(this))}
                            </div>
                        </div>

                        <div style={{height: 20}}></div>


                    </div>
                </div>
        );
    }
}

export default Song;