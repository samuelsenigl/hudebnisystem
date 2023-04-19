import React, { useState, useEffect } from "react";
import '../styles/tiles.css';
import '../styles/other.css';
import { Link, Navigate } from "react-router-dom";
import Axios from 'axios';

// import utilities
import { checkForErrorsInRequest } from '../utilities/RequestsUtilities.js';

// import components
import RoundButton from '../components/RoundButton.js';

class NewTask extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            redirectTo: null,
            noteTitle: "",
            noteDescr: "",
            noteDate: "2023-02-21",
            noteStatus: "not_done",
            teamMembers: ([{"id_musician":0,"name":"name","surname":"surname","selected":0}]),
            peopleInTeam: [{id: 1, name: "Markétka Šeniglová", selected: 0},
                           {id: 2, name: "Beny Šenigl", selected: 0},
                           {id: 3, name: "Grace Rector", selected: 0}],
            action: "", // can be "update" or "duplicate"
        }
    }

    componentDidMount(){
        this.setState({ redirectTo: null });
        this.loadData();
        this.setState({ noteDate: this.getTodaysDate() });
    }

    loadData = async () => {
        Axios.get('/api/team/members?notMe=1').then(response => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
            var newTeamMembers = [];
            for(let oneRow of response.data.result){
                var oneObject = oneRow;
                oneObject.selected = 0;
                newTeamMembers.push(oneObject);
            }
            //alert(JSON.stringify(response.data.result.length));
            this.setState({ teamMembers: newTeamMembers })
        });

        // load task I want to duplicate
        const { duplicate } = Object.fromEntries(new URLSearchParams(window.location.search));
        if(duplicate != undefined && Number.isInteger(Number(duplicate))){
            this.setState({ action: "duplicate" });

            Axios.get('/api/tasks/get/'+duplicate).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }

                this.setState({ noteTitle: response.data.result[0].title });
                this.setState({ noteDescr: response.data.result[0].content });
                this.setState({ noteStatus: response.data.result[0].status });
                this.setState({ noteTitle: response.data.result[0].title });
            });
        }

        // load task I want to update
        const { update } = Object.fromEntries(new URLSearchParams(window.location.search));
        if(update != undefined && Number.isInteger(Number(update))){
            this.setState({ action: "update" });

            Axios.get('/api/tasks/get/'+update).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }

                this.setState({ noteTitle: response.data.result[0].title });
                this.setState({ noteDescr: response.data.result[0].content });
                this.setState({ noteStatus: response.data.result[0].status });
                this.setState({ noteTitle: response.data.result[0].title });
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

    selectUnselectCategory = (id_musician) => {
        var numSelectedCategories = 0;
        var selectedCategory = "";

        var newTeamMembersArray = this.state.teamMembers;
        for(let oneRow of newTeamMembersArray){
            if(oneRow.id_musician == id_musician){
                oneRow.selected = !oneRow.selected;
            }
        }
        this.setState({ teamMembers: newTeamMembersArray });
    }

    onSaveNewTask = async () => {
        if(this.state.noteTitle == ""){
            alert("Je potřeba vyplnit název úkolu.");
            return
        }
        else if(this.state.noteDescr == ""){
            alert("Je potřeba vyplnit popis úkolu.");
            return
        }
        var shareWithArray = [];
        for(let oneRow of this.state.teamMembers){
            if(oneRow.selected){
                shareWithArray.push(oneRow.id_musician)
            }
        }

        var url = "/api/tasks/ins";
        const { update } = Object.fromEntries(new URLSearchParams(window.location.search));
        if(update != undefined && Number.isInteger(Number(update))){
            url = "/api/tasks/upd/"+update;
        }

        //alert("Title: "+this.state.noteTitle+"\nDescr: "+this.state.noteDescr+"\nDate: "+this.state.noteDate+"\nStatus: "+this.state.noteStatus+"\nShare with: "+JSON.stringify(shareWithArray));

        await Axios.post(url, {
            title: this.state.noteTitle,
            content: this.state.noteDescr,
            date: this.state.noteDate,
            status: this.state.noteStatus,
            shareWith: shareWithArray,
        }).then((response) => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }

            const { update } = Object.fromEntries(new URLSearchParams(window.location.search));
            if(update != undefined && Number.isInteger(Number(update))){
                this.setState({ redirectTo: "/Task?id="+update });
            }
            else {
                this.setState({ redirectTo: "/Tasks" });
            }
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
                        <span className="fontPoppinsSemiBold15">{"Nový úkol"}</span>
                        <div style={{height: 10}}></div>

                        <div className="verticalStack" style={{padding: 12, backgroundColor: "#F4F4F8"}}>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Nadpis úkolu:*</span>
                                <input className="profileTileInputText" type="text" style={{flex: 1}} id="noteTitle" name="noteTitle" value={this.state.noteTitle} onChange={(event) => this.setState({noteTitle: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Obsah:*</span>
                                <textarea className="" type="text" style={{flex: 1, border: 0, resize: "none"}} rows={10} name="obsah" placeholder="" value={this.state.noteDescr} onChange={e => this.setState({ noteDescr: e.target.value })}></textarea>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Datum:*</span>
                                <input className="profileTileInputText" type="date" style={{flex: 1}} id="inputMiddleName" name="inputMiddleName" value={this.state.noteDate} onChange={e => this.setState({ noteDate: e.target.value })} />
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Stav:*</span>

                                <select name="tonina" class="select-form" className="profileTileInputText" style={{flex: 1}} value={this.state.noteStatus} onChange={e => {this.setState({ noteStatus: e.target.value });}}>
                                    <option value="not_done">Čeká na splnění</option>
                                    <option value="done">Hotový</option>
                                </select>
                            </div>

                            <div style={{height: 10}}></div>

                            {this.state.action != "update" ? <div className="verticalStack">

                                <span className="fontPoppinsRegular13" style={{marginBottom: 0}}>Sdílet s:</span>
                                {this.state.teamMembers.map(function (item) {
                                    return (
                                        <div className="horizontalStack" style={{marginTop: 3, marginBottom: 3}} onClick={() => this.selectUnselectCategory(item.id_musician)}>
                                            <input type="checkbox" className="clickable" checked={item.selected} />
                                            <label for={item.id+""+item.name} className="fontPoppinsRegular13" style={{marginLeft: 5}}>{item.name} {item.surname}</label>
                                        </div>
                                    )
                                }.bind(this))}

                            </div> : null}

                            <div style={{height: 15}}></div>

                            <div className="horizontalStack">
                                <RoundButton title={"Uložit"} style={{color: "white", backgroundColor: "#ff6600"}} onClick={this.onSaveNewTask} whiteText={true} />
                            </div>

                        </div>

                    </div>

                    <div style={{height: 20}}></div>
                </div>
            </div>
        );
    }
}

export default NewTask;