import React, { useState, useEffect } from "react";
import '../styles/tiles.css';
import '../styles/other.css';
import Axios from 'axios';

// import utilities
import { checkForErrorsInRequest } from '../utilities/RequestsUtilities.js';

// import components
import RoundButton from '../components/RoundButton.js';
import SearchBox from '../components/SearchBox.js';
import GrayTextButton from '../components/GrayTextButton.js';

class SearchTileSongs extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            searchTileExpanded: false, // default is: false
            selectedSearchingOption: "and",
            selectedSongName: "",
            selectedSongKey: "",
            selectedSongAuthor: "",
            selectedSongCapo: "",
            selectedSongTags: "",
            selectedSongTempo: "",
            windowHeight: 1000,
        }
    }

    async componentDidMount(){
        window.addEventListener('resize', this.checkWindowWidth);

        this.checkWindowWidth();
        await new Promise(resolve => setTimeout(resolve, 50));
        this.checkWindowWidth();
    }

    componentWillUnmount() { window.removeEventListener('resize', this.checkWindowWidth); }
    checkWindowWidth = () => { this.setState({ windowHeight: window.innerWidth }); }

    advancedSearchAction = () => {
        this.setState({ searchTileExpanded: !this.state.searchTileExpanded });
    }

    loadData = () => {
        //this.loadTeamTypes();
    }

    actionSearch = () => {
        this.setState({ searchTileExpanded: false });
        //alert("název písně: "+this.state.selectedSongName+"\ntónina: "+this.state.selectedSongKey+"\nautor: "+this.state.selectedSongAuthor+"\ncapo: "+this.state.selectedSongCapo+"\ntags: "+this.state.selectedSongTags+"\ntempo: "+this.state.selectedSongTempo+"\nand/or: "+this.state.selectedSearchingOption)
        this.props.setSearchAdvancedSongs({searchingOption: this.state.selectedSearchingOption, title: this.state.selectedSongName, author: this.state.selectedSongAuthor, songKey: this.state.selectedSongKey, capo: this.state.selectedSongCapo, tags: this.state.selectedSongTags, tempo: this.state.selectedSongTempo});
    }

    actionClearAll = () => {
        this.setState({ selectedSongName: "" });
        this.setState({ selectedSongKey: "" });
        this.setState({ selectedSongAuthor: "" });
        this.setState({ selectedSongCapo: "" });
        this.setState({ selectedSongTags: "" });
        this.setState({ selectedSongTempo: "" });
        this.setState({ selectedSearchingOption: "and" });
    }

    actionCancel = () => {
        this.setState({ searchTileExpanded: false });
    }

    render() {
        return (
            <div className="searchTile">

                <div className="verticalStack">
                    <div className="horizontalStackCenter">
                        <div className="" style={{minWidth: "200px", maxWidth: "380px", width: "100%"}}>
                            <SearchBox searchText={this.props.searchText} setSearchText={this.props.setSearchText} />
                        </div>
                        {this.state.windowHeight >= 900 ? <GrayTextButton title={"Pokročilé vyhledávání"} style={{marginLeft: "18px"}} onClick={this.advancedSearchAction} /> : null }
                    </div>
                </div>
                <div className="verticalStack" style={{display: this.state.searchTileExpanded ? "" : "none", marginTop: 20}}>
                    <span className="fontPoppinsSemiBold15">Pokročilé vyhledávání:</span>

                    <div className="horizontalStack" style={{backgroundColor: "#F4F4F8", padding: 24, marginTop: 15}}>
                        <div className="verticalStack flex">
                            <span className="fontPoppinsRegular13">Název písně:</span>
                            <input className="fontPoppinsRegular13" type="text" id="song_name" name="song_name" autocomplete="off" placeholder="" value={this.state.selectedSongName} onChange={e => {this.setState({ selectedSongName: e.target.value });}} style={{width: "100%", marginTop: 5, marginBottom: 5, border: "0px solid black"}}/>
                            <div style={{height: 10}}></div>
                            <span className="fontPoppinsRegular13">Tónina:</span>
                            <select className="profileTileInputText" name="song_key" id="song_key" style={{width: "100%", marginTop: 5, marginBottom: 5, border: "0px solid black"}} value={this.state.selectedSongKey} onChange={e => {this.setState({ selectedSongKey: e.target.value });}}>
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

                        <div style={{width: 50}}></div>

                        <div className="verticalStack flex">
                            <span className="fontPoppinsRegular13">Autor:</span>
                            <input className="fontPoppinsRegular13" type="text" id="author" name="author" autocomplete="off" placeholder="" value={this.state.selectedSongAuthor} onChange={e => {this.setState({ selectedSongAuthor: e.target.value });}} style={{width: "100%", marginTop: 5, marginBottom: 5, border: "0px solid black"}}/>
                            <div style={{height: 10}}></div>
                            <span className="fontPoppinsRegular13">Capo:</span>
                            <input className="fontPoppinsRegular13" type="number" id="capo" name="capo" autocomplete="off" placeholder="" min={-50} max={50} value={this.state.selectedSongCapo} onChange={e => {this.setState({ selectedSongCapo: e.target.value });}} style={{width: "100%", marginTop: 5, marginBottom: 5, border: "0px solid black"}}/>
                        </div>

                        <div style={{width: 50}}></div>

                        <div className="verticalStack flex">
                            <span className="fontPoppinsRegular13">Tagy (oddělené mezerou): (COMING LATER)</span>
                            <input className="fontPoppinsRegular13" type="text" id="tag" name="tag" autocomplete="off" placeholder="" value={this.state.selectedSongTags} onChange={e => {this.setState({ selectedSongTags: e.target.value });}} style={{width: "100%", marginTop: 5, marginBottom: 5, border: "0px solid black"}}/>
                            <div style={{height: 10}}></div>
                            <span className="fontPoppinsRegular13">Tempo:</span>
                            <input className="fontPoppinsRegular13" type="number" id="tempo" name="tempo" autocomplete="off" placeholder="" min={0} max={200} value={this.state.selectedSongTempo} onChange={e => {this.setState({ selectedSongTempo: e.target.value });}} style={{width: "100%", marginTop: 5, marginBottom: 5, border: "0px solid black"}}/>
                        </div>

                        <div style={{width: 50}}></div>

                        <div className="verticalStack flex">
                            <div className="horizontalStack">
                                <div className="horizontalStackCenter" onChange={event => this.setState({ selectedSearchingOption: event.target.value })}>
                                    <label className="fontPoppinsRegular13">{"A"}</label>
                                    <input type="radio" id="and" name="selectedSearchingOption" value={"and"} checked={this.state.selectedSearchingOption == "and" ? true : false}/>
                                </div>
                                <div style={{width: 10}}></div>
                                <div className="horizontalStackCenter" onChange={event => this.setState({ selectedSearchingOption: event.target.value })}>
                                    <label className="fontPoppinsRegular13" style={{textAlign: "center"}}>{"Nebo"}</label>
                                    <input type="radio" id="or" name="selectedSearchingOption" value={"or"} checked={this.state.selectedSearchingOption == "or" ? true : false}/>
                                </div>
                            </div>
                            <span className="fontPoppinsRegular13Gray" style={{marginTop: 20}}>{"Použitím “A” dostanete výsledky, které splňují všechny podmínky. Použitím “Nebo” dostanete výsledky, které splňují alespoň jednu podmínku."}</span>
                        </div>
                    </div>

                    <div className="horizontalStack" style={{marginTop: "20px"}}>
                        <RoundButton title={"Vyhledat"} style={{marginRight: "10px", backgroundColor: "#ff6600"}} whiteText={true} onClick={this.actionSearch} />
                        <RoundButton title={"Vyčistit"} style={{marginRight: "10px", backgroundColor: "#74788D"}} whiteText={true} onClick={this.actionClearAll} />
                        <RoundButton title={"Zavřít"} style={{marginRight: "10px", backgroundColor: "#74788D"}} whiteText={true} onClick={this.actionCancel} />
                        <div className="flex"></div>
                    </div>

                </div>

            </div>
        );
    }
}

export default SearchTileSongs;
