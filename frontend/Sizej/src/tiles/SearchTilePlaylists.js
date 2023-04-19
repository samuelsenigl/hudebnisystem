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

class SearchTilePlaylists extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            searchTileExpanded: false, // default is: false
            selectedSearchingOption: "and",
            selectedEventName: "",
            selectedAddress: "",
            selectedNote: "",
            selectedMember: 0,
            selectedDate: "0000-00-00",
            team_members: [{id: 0, name: "Team member"}],
            windowHeight: 1000,
        }
    }

    async componentDidMount(){
        this.loadData();
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
        this.loadTeamMembers();
    }

    loadTeamMembers = () => {
        Axios.get('/api/team/members').then(response => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
            this.setState({ team_members: response.data.result });
        });
    }

    actionSearch = () => {
        this.setState({ searchTileExpanded: false });
        //alert("název událost: "+this.state.selectedEventName+"\nadresa: "+this.state.selectedAddress+"\npoznámky: "+this.state.selectedNote+"\ndatum: "+this.state.selectedDate+"\nčlen týmu: "+this.state.selectedMember+"\nand/or: "+this.state.selectedSearchingOption)
        this.props.setSearchAdvancedPlaylists({searchingOption: this.state.selectedSearchingOption, eventName: this.state.selectedEventName, address: this.state.selectedAddress, member: this.state.selectedMember, note: this.state.selectedNote, date: this.state.selectedDate});
    }

    actionClearAll = () => {
        this.setState({ selectedEventName: "" });
        this.setState({ selectedAddress: "" });
        this.setState({ selectedNote: "" });
        this.setState({ selectedMember: 0 });
        this.setState({ selectedDate: "0000-00-00" });
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
                            <span className="fontPoppinsRegular13">Název události:</span>
                            <input className="fontPoppinsRegular13" type="text" id="event_name" name="event_name" autocomplete="off" placeholder="" value={this.state.selectedEventName} onChange={e => {this.setState({ selectedEventName: e.target.value });}} style={{width: "100%", marginTop: 5, marginBottom: 5, border: "0px solid black"}}/>
                            <div style={{height: 10}}></div>
                            <span className="fontPoppinsRegular13">Hraje člen: (COMING LATER)</span>
                            <select className="profileTileInputText" name="member" id="member" style={{width: "100%", marginTop: 5, marginBottom: 5, border: "0px solid black"}} value={this.state.selectedMember} onChange={e => {this.setState({ selectedMember: e.target.value });}}>
                                <option value=""></option>

                                {this.state.team_members.map(function (item) {
                                    return (
                                        <option value={item.id_musician}>{item.name} {item.surname}</option>
                                    )
                                }.bind(this))}

                            </select>
                        </div>

                        <div style={{width: 50}}></div>

                        <div className="verticalStack flex">
                            <span className="fontPoppinsRegular13">Adresa:</span>
                            <input className="fontPoppinsRegular13" type="text" id="address" name="address" autocomplete="off" placeholder="" value={this.state.selectedAddress} onChange={e => {this.setState({ selectedAddress: e.target.value });}} style={{width: "100%", marginTop: 5, marginBottom: 5, border: "0px solid black"}}/>
                            <div style={{height: 10}}></div>
                            <span className="fontPoppinsRegular13">Poznámka:</span>
                            <input className="fontPoppinsRegular13" type="text" id="note" name="note" autocomplete="off" placeholder="" min={-50} max={50} value={this.state.selectedNote} onChange={e => {this.setState({ selectedNote: e.target.value });}} style={{width: "100%", marginTop: 5, marginBottom: 5, border: "0px solid black"}}/>
                        </div>

                        <div style={{width: 50}}></div>

                        <div className="verticalStack flex">
                            <span className="fontPoppinsRegular13">Datum:</span>
                            <input className="fontPoppinsRegular13" type="date" id="date" name="date" autocomplete="off" placeholder="" value={this.state.selectedDate} onChange={e => {this.setState({ selectedDate: e.target.value });}} style={{width: "100%", marginTop: 5, marginBottom: 5, border: "0px solid black"}}/>
                            <div style={{height: 10}}></div>
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

export default SearchTilePlaylists;
