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

class SearchTileTasks extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            searchTileExpanded: false, // default is: false
            selectedSearchingOption: "and",
            selectedTaskTitle: "",
            selectedTaskContent: "",
            selectedTaskStatus: "",
            selectedCreatedById: 0,
            selectedSharedWithId: 0,
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
        //alert("název úkolu: "+this.state.selectedTaskTitle+"\nobsah úkolu: "+this.state.selectedTaskContent+"\nvytvořeno: "+this.state.selectedCreatedById+"\nsdíleno s: "+this.state.selectedSharedWithId+"\nstav: "+this.state.selectedTaskStatus+"\nand/or: "+this.state.selectedSearchingOption)
        this.props.setSearchAdvancedTasks({searchingOption: this.state.selectedSearchingOption, taskTitle: this.state.selectedTaskTitle, taskContent: this.state.selectedTaskContent, createdBy: this.state.selectedCreatedById, sharedWith: this.state.selectedSharedWithId, status: this.state.selectedTaskStatus});
    }

    actionClearAll = () => {
        this.setState({ selectedTaskTitle: "" });
        this.setState({ selectedTaskContent: "" });
        this.setState({ selectedTaskStatus: "" });
        this.setState({ selectedCreatedById: 0 });
        this.setState({ selectedSharedWithId: 0 });
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
                            <span className="fontPoppinsRegular13">Název úkolu:</span>
                            <input className="fontPoppinsRegular13" type="text" id="task_title" name="task_title" autocomplete="off" placeholder="" value={this.state.selectedTaskTitle} onChange={e => {this.setState({ selectedTaskTitle: e.target.value });}} style={{width: "100%", marginTop: 5, marginBottom: 5, border: "0px solid black"}}/>
                            <div style={{height: 10}}></div>
                            <span className="fontPoppinsRegular13">Obsah úkolu:</span>
                            <input className="fontPoppinsRegular13" type="text" id="task_content" name="task_content" autocomplete="off" placeholder="" value={this.state.selectedTaskContent} onChange={e => {this.setState({ selectedTaskContent: e.target.value });}} style={{width: "100%", marginTop: 5, marginBottom: 5, border: "0px solid black"}}/>
                        </div>

                        <div style={{width: 50}}></div>

                        <div className="verticalStack flex">
                            <span className="fontPoppinsRegular13">Vytvořeno:</span>
                            <select className="profileTileInputText" name="created_by" id="created_by" style={{width: "100%", marginTop: 5, marginBottom: 5, border: "0px solid black"}} value={this.state.selectedCreatedById} onChange={e => this.setState({ selectedCreatedById: e.target.value })}>
                                <option value=""></option>

                                {this.state.team_members.map(function (item) {
                                    return (
                                        <option value={item.id_musician}>{item.name} {item.surname}</option>
                                    )
                                }.bind(this))}

                            </select>
                            <div style={{height: 10}}></div>
                            <span className="fontPoppinsRegular13">Sdíleno s: (COMING LATER)</span>
                            <select className="profileTileInputText" name="shared_with" id="shared_with" style={{width: "100%", marginTop: 5, marginBottom: 5, border: "0px solid black"}} value={this.state.selectedSharedWithId} onChange={e => {this.setState({ selectedSharedWithId: e.target.value });}}>
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
                            <span className="fontPoppinsRegular13">Stav:</span>
                            <select className="profileTileInputText" name="task_status" id="task_status" style={{width: "100%", marginTop: 5, marginBottom: 5, border: "0px solid black"}} value={this.state.selectedTaskStatus} onChange={e => {this.setState({ selectedTaskStatus: e.target.value });}}>
                                <option value=""></option>
                                <option value="not_done">Čeká na splnění</option>
                                <option value="done">Hotový</option>
                                <option value="mistake">Chyba v zadání úkolu</option>
                            </select>
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

export default SearchTileTasks;
