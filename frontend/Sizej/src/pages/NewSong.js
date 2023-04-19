import React, { useState, useEffect } from "react";
import '../styles/tiles.css';
import '../styles/other.css';
import { Link, Navigate } from "react-router-dom";
import Axios from 'axios';

// import utilities
import { checkForErrorsInRequest } from '../utilities/RequestsUtilities.js';

// import components
import RoundButton from '../components/RoundButton.js';

class NewSong extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            redirectTo: null,
            songTitle: "",
            songAuthor: "",
            songContent: "",
            songCapo: 0,
            songTempo: 0,
            songKey: "",
            songNote: "",
            songUrl: "",
            songPublic: 0,
            selectedTagsArray: [],
            newTagText: "",
        }
    }

    componentDidMount(){
        this.setState({ redirectTo: null });
        this.loadData();
    }

    loadData = async () => {
        // load song I want to update
        const { update } = Object.fromEntries(new URLSearchParams(window.location.search));
        if(update != undefined && Number.isInteger(Number(update))){
            this.setState({ action: "update" });

            Axios.get('/api/songs/get/'+update).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }

                this.setState({ songTitle: response.data.result[0].title });
                this.setState({ songAuthor: response.data.result[0].author });
                this.setState({ songContent: response.data.result[0].content });
                this.setState({ songCapo: response.data.result[0].capo });
                this.setState({ songTempo: response.data.result[0].tempo });
                this.setState({ songKey: response.data.result[0].song_key });
                this.setState({ songNote: response.data.result[0].shared_note });
                this.setState({ songUrl: response.data.result[0].original_url });
                this.setState({ songPublic: response.data.result[0].is_public });
            });

            Axios.get('/api/tags/get/'+update).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                var tagsArray = [];
                for(let oneRow of response.data.result){
                    tagsArray.push(oneRow.id_tag);
                }
                this.setState({ selectedTagsArray: tagsArray })
            });

        }
    }

    onSaveNewSong = () => {
        if(this.state.songTitle == ""){
            alert("Je potřeba vyplnit název písně.");
            return
        }
        else if(this.state.songTitle == ""){
            alert("Je potřeba vyplnit obsah písně.");
            return
        }

        //alert("Title: "+this.state.songTitle+"\nAuthor: "+this.state.songAuthor+"\nContent: "+this.state.songContent+"\nCapo: "+this.state.songCapo+"\nTempo: "+this.state.songTempo+"\nTonina: "+this.state.songKey+"\nTagy: "+JSON.stringify(this.state.selectedTagsArray)+"\nPoznamka: "+this.state.songNote+"\nURL: "+this.state.songUrl+"\nPublic: "+this.state.songPublic);

        var newUrl = this.state.songUrl;
        if(newUrl === "" || newUrl.includes("embed")){ /* dont do nothing */ }
        else newUrl = "https://www.youtube.com/embed/"+newUrl.substring(newUrl.lastIndexOf("watch?v=")+8);
        //alert("new url: "+newUrl);

        var url = "/api/songs/ins";
        const { update } = Object.fromEntries(new URLSearchParams(window.location.search));
        if(update != undefined && Number.isInteger(Number(update))){
            url = "/api/songs/upd/"+update;
        }

        Axios.post(url, {
            title: this.state.songTitle,
            author: this.state.songAuthor,
            content: this.state.songContent,
            capo: this.state.songCapo,
            tempo: this.state.songTempo,
            song_key: this.state.songKey,
            tags: this.state.selectedTagsArray,
            note: this.state.songNote,
            original_url: newUrl,
            is_public: this.state.songPublic
        }).then((response) => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }

            const { update } = Object.fromEntries(new URLSearchParams(window.location.search));
            if(update != undefined && Number.isInteger(Number(update))){
                this.setState({ redirectTo: "/Song?id="+update });
            }
            else {
                this.setState({ redirectTo: "/Songs" });
            }
        });
    }

    addTagToSong = (event) => {
        if(event.key === 'Enter') {
            if (event.target.value.includes(' ')) {
                alert("Tag nesmí obsahovat mezery");
                return;
            }
            var tag = event.target.value;
            var arrayOfSelectedTags = this.state.selectedTagsArray;

            var found = false;
            for(let oneRow of arrayOfSelectedTags){
                if(oneRow == tag)found = true;
            }
            if(!found)arrayOfSelectedTags.push(tag);

            this.setState({ selectedTagsArray: arrayOfSelectedTags });
            this.setState({ newTagText: "" });
        }
    }

    deleteTagFromSong = (tag) => {
        var arrayOfSelectedTags = [];
        for(let oneRow of this.state.selectedTagsArray){
            if(oneRow != tag){
                arrayOfSelectedTags.push(oneRow);
            }
        }
        this.setState({ selectedTagsArray: arrayOfSelectedTags });
    }

    render() {
        if (this.state.redirectTo) {
            return <Navigate to={this.state.redirectTo} />
        }

        return(
            <div className="verticalStack flex" style={{height: "calc(100vh - 80px)", overflowY: "scroll"}}>

                <div className="verticalStack">

                    <div className="universalTile">
                        <span className="fontPoppinsSemiBold15">{"Nová píseň"}</span>
                        <div style={{height: 10}}></div>

                        <div className="verticalStack" style={{padding: 12, backgroundColor: "#F4F4F8"}}>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Název písně:*</span>
                                <input className="profileTileInputText" type="text" style={{width: "100%"}} id="songTitle" name="songTitle" value={this.state.songTitle} onChange={(event) => this.setState({songTitle: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Autor:</span>
                                <input className="profileTileInputText" type="text" style={{width: "100%"}} id="songAuthor" name="songAuthor" value={this.state.songAuthor} onChange={(event) => this.setState({songAuthor: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Obsah:*</span>
                                <span className="fontPoppinsRegular13Gray">{"Akord napiš takto [D] nebo [C#m]. Na konci řádku napiš [br] aby se text odřádkoval."}</span>
                                <textarea className="" type="text" style={{width: "100%", border: 0, resize: "none"}} rows={15} name="obsah" placeholder="" value={this.state.songContent} onChange={e => this.setState({ songContent: e.target.value })}></textarea>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Capo:</span>
                                <input className="profileTileInputText" type="number" style={{width: "100%"}} id="songCapo" name="songCapo" value={this.state.songCapo} onChange={(event) => this.setState({songCapo: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Tempo:</span>
                                <input className="profileTileInputText" type="number" style={{width: "100%"}} id="songTempo" name="songTempo" value={this.state.songTempo} onChange={(event) => this.setState({songTempo: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Tónina:</span>
                                <select name="songKey" id="songKey" className="profileTileInputText fontPoppinsRegular13 flex" value={this.state.songKey} onChange={e => {this.setState({ songKey: e.target.value });}}>
                                    <option value=""></option>
                                    <option value="C">C</option>
                                    <option value="C#">C#</option>
                                    <option value="D">D</option>
                                    <option value="D#">D#</option>
                                    <option value="E">E</option>
                                    <option value="F">F</option>
                                    <option value="F#">F#</option>
                                    <option value="G">G</option>
                                    <option value="G#">G#</option>
                                    <option value="A">A</option>
                                    <option value="A#">A#</option>
                                    <option value="H">H</option>
                                </select>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13">Tagy:</span>
                                {/*<span className="fontPoppinsRegular13Gray" style={{marginBottom: 10}}>{"(např.: #rychla #pomala #cz #en #sk)"}</span>*/}
                                {/*<input className="profileTileInputText" type="text" placeholder={"#rychla #ceska"} style={{width: "100%"}} id="songTags" name="songTags" value={this.state.songTags} onChange={(event) => this.setState({songTags: event.target.value})}/>*/}
                            </div>

                            <div className="horizontalStack flex" style={{backgroundColor: "white", paddingTop: 10, overflowX: "visible", flexWrap: "wrap", alignItems: "center"}}>

                                {this.state.selectedTagsArray.map(function (item) {
                                    return (
                                        <label className="fontPoppinsRegular13 clickable" onClick={() => this.deleteTagFromSong(item)} style={{marginLeft: 10, marginBottom: 10, border: "1px solid #556EE6", color: "#556EE6", whiteSpace: "nowrap", borderRadius: 5, paddingLeft: 5, paddingRight: 5}}>{item} {"x"}</label>
                                    )
                                }.bind(this))}

                                <input className="profileTileInputText fontPoppinsRegular13" type="text" placeholder={"Write new tag and enter..."} style={{width: 200, marginLeft: 10, marginBottom: 10}} id="songNewTag" name="songNewTag" value={this.state.newTagText} onChange={e => this.setState({ newTagText: e.target.value })} onKeyUp={(event) => this.addTagToSong(event)}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Poznámka:</span>
                                <textarea className="" type="text" style={{width: "100%", border: 0, resize: "none"}} rows={5} name="obsah" placeholder="" value={this.state.songNote} onChange={e => this.setState({ songNote: e.target.value })}></textarea>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>URL na Youtube:</span>
                                <input className="profileTileInputText" type="text" placeholder={"https://www.youtube.com/embed/Ak5WTb-mgeA"} style={{width: "100%"}} id="songUrl" name="songUrl" value={this.state.songUrl} onChange={(event) => this.setState({songUrl: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>{"Chcete aby byla tato píseň veřejná i pro lidi, kteří nejsou z vašeho týmu?* (cizí lidé ji nebudou moci upravit)"}</span>

                                <select name="songPublic" id="songPublic" className="profileTileInputText fontPoppinsRegular13 flex" value={this.state.songPublic} onChange={e => {this.setState({ songPublic: e.target.value });}}>
                                    <option value={0}>{"Ne, nezveřejňovat"}</option>
                                    <option value={1}>{"Ano, zveřejnit"}</option>
                                </select>
                            </div>

                            <div style={{height: 15}}></div>

                            <div className="horizontalStack">
                                <RoundButton title={"Uložit"} style={{color: "white", backgroundColor: "#ff6600"}} onClick={this.onSaveNewSong} whiteText={true} />
                            </div>

                        </div>

                    </div>

                    <div style={{height: 20}}></div>
                </div>
            </div>
        );
    }
}

export default NewSong;