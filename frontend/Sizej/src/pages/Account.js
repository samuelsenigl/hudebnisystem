import React, { useState, useEffect } from "react";
import '../styles/other.css';
import '../styles/pages.css';
import Axios from 'axios';

// import utilities
import { checkForErrorsInRequest } from '../utilities/RequestsUtilities.js';

// import components
import RoundButton from '../components/RoundButton.js';

// import assets
import icon_close from '../assets/icon_close.png';

class Account extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user_id: 0,
            user_name: "Name",
            user_surname: "Surname",
            user_email: "user@gmail.com",
            user_old_password: "",
            user_new_password: "",
            user_new_password_two: "",
            team_id: 0,
            team_name: "Team name",
            team_code: "join_code",
            role_name: "Role name",
            roles_array: [{id_role: 0, name: "role_name"}],
            team_members: [{id: 0, name: "Team member"}],
        }
    }

    componentDidMount(){
        this.loadData();
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.searchText !== this.props.searchText) {
            this.setState({ actualPage: 0 });
            this.loadData();
        }
    }

    loadData = () => {
        Axios.get('/api/users/logged').then(response => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
            this.setState({ user_id: response.data.result[0].id_musician  });
            this.setState({ user_name: response.data.result[0].name  });
            this.setState({ user_surname: response.data.result[0].surname  });
            this.setState({ user_email: response.data.result[0].email  });
        });
        Axios.get('/api/teams/logged').then(response => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
            this.setState({ team_id: response.data.result[0].id_team  });
            this.setState({ team_name: response.data.result[0].name  });
            this.setState({ team_code: response.data.result[0].join_code  });
        });
        Axios.get('/api/roles/logged').then(response => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
            this.setState({ roles_array: response.data.result });
            this.loadRoleName(response.data.result);
        });
        Axios.get('/api/team/members').then(response => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
            this.setState({ team_members: response.data.result });
        });
    }

    saveBasicUserInfo = () => {
        if(this.state.user_id == 0) return;
        else if(this.state.user_name == ""){ alert("Je potřeba vyplnit jméno."); return; }
        else if(this.state.user_surname == ""){ alert("Je potřeba vyplnit přijmení."); return; }
        else if(this.state.user_email == ""){ alert("Je potřeba vyplnit email."); return; }

        if (window.confirm("Opravdu chcete uložit a tím změnit klíčová data vašeho účtu?") == true) {
            Axios.post("/api/users/upd/"+this.state.user_id, {
                name: this.state.user_name,
                surname: this.state.user_surname,
                email: this.state.user_email
            }).then((response) => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                window.location.reload();
            });
        }
    }

    saveNewPassword = () => {
        if(this.state.user_id == 0) return;
        else if(this.state.user_old_password == ""){ alert("Je potřeba vyplnit staré heslo."); return; }
        else if(this.state.user_new_password == ""){ alert("Je potřeba vyplnit nové heslo."); return; }
        else if(this.state.user_new_password_two == ""){ alert("Je potřeba vyplnit nové heslo podruhé."); return; }
        else if(this.state.user_new_password != this.state.user_new_password_two){ alert("Nezadal jste nové heslo dvakrát stejně."); return; }

        if (window.confirm("Opravdu chcete změnit heslo?") == true) {
            Axios.post("/api/users/newpassword", {
                old_password: this.state.user_old_password,
                new_password: this.state.user_new_password,
            }).then((response) => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }

                if(response.data.passwordChanged == 1){
                    alert("Heslo úspěšně změněno.");
                }
                else {
                    alert("Heslo nebylo změněno.");
                }
                this.setState({ user_email: ""  });
                this.setState({ user_email: ""  });
                this.setState({ user_email: ""  });
            });
        }
    }

    saveBasicTeamInfo = () => {
        if(this.state.team_id == 0) return;
        else if(this.state.team_name == ""){ alert("Je potřeba vyplnit název týmu."); return; }
        else if(this.state.team_code == ""){ alert("Je potřeba vyplnit kód vašeho týmu."); return; }

        if (window.confirm("Opravdu chcete uložit a tím změnit klíčová data vašeho týmu?") == true) {
            Axios.post("/api/teams/upd", {
                name: this.state.team_name,
                code: this.state.team_code,
            }).then((response) => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                //window.location.reload();
                alert("Data změněna.");
            });
        }
    }

    deleteMemberFromTeam = (id) => {
        //this.props.openAlertMessage("test","OK");
        if (window.confirm("Opravdu chcete odebrat člena z vašeho týmu?") == true) {
            // yes
            Axios.get('/api/teams/members/del/'+id).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                window.location.reload();
            });
        } else {
            // no
        }
    }

    loadRoleName = (rolesArray) => {
        //alert(JSON.stringify(rolesArray));
        var highestRole = {id_role: 0, name: "Error"};
        for(let oneRow of rolesArray){
            if(highestRole.id_role == 0) highestRole = oneRow;
            else if(oneRow.id_role < highestRole.id_role) highestRole = oneRow;
        }

        if(highestRole.name == "admin")this.setState({ role_name: "Admin" });
        if(highestRole.name == "team_leader")this.setState({ role_name: "Team leader" });
        if(highestRole.name == "team_member")this.setState({ role_name: "Team member" });
    }

    isTeamLeader = (rolesArray) => {
        var isTeamLeader = false;

        for(let oneRow of rolesArray){
            if(oneRow.name == "team_leader")isTeamLeader = true;
        }

        return isTeamLeader;
    }

    render() {
        return (
            <div className="verticalStack flex" style={{height: "calc(100vh - 80px)", overflowY: "scroll"}}>

                <div className="verticalStack">

                    <div className="universalTile">
                        <div className="verticalStack">
                            <span className="fontPoppinsSemiBold15">{"Účet: "}{this.state.user_name} {this.state.user_surname}</span>
                            <span className="fontPoppinsRegular13Gray">{"Název týmu: "}{this.state.team_name}</span>
                            <span className="fontPoppinsRegular13Gray">{"Role: "}{this.state.role_name}</span>
                        </div>
                    </div>

                    <div className="universalTile">
                        <span className="fontPoppinsSemiBold15">{"Vaše údaje"}</span>
                        <div style={{height: 10}}></div>

                        <div className="verticalStack" style={{padding: 12, backgroundColor: "#F4F4F8"}}>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Jméno:*</span>
                                <input className="profileTileInputText" type="text" style={{flex: 1}} id="inputFirstName" name="inputFirstName" value={this.state.user_name} onChange={(event) => this.setState({user_name: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Příjmení:*</span>
                                <input className="profileTileInputText" type="text" style={{flex: 1}} id="inputFirstName" name="inputFirstName" value={this.state.user_surname} onChange={(event) => this.setState({user_surname: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Email:*</span>
                                <input className="profileTileInputText" type="text" style={{flex: 1}} id="inputFirstName" name="inputFirstName" value={this.state.user_email} onChange={(event) => this.setState({user_email: event.target.value})}/>
                            </div>

                            <div style={{height: 15}}></div>

                            <div className="horizontalStack">
                                <RoundButton title={"Uložit změny"} style={{color: "white", backgroundColor: "#d4daf9"}} onClick={() => this.saveBasicUserInfo()} whiteText={false} />
                            </div>
                        </div>
                    </div>

                    <div className="universalTile">
                        <span className="fontPoppinsSemiBold15">{"Změna hesla"}</span>
                        <div style={{height: 10}}></div>

                        <div className="verticalStack" style={{padding: 12, backgroundColor: "#F4F4F8"}}>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Staré heslo:*</span>
                                <input className="profileTileInputText" type="password" style={{flex: 1}} id="user_old_password" name="user_old_password" autoComplete="new-password" value={this.state.user_old_password} onChange={(event) => this.setState({user_old_password: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Nové heslo:*</span>
                                <input className="profileTileInputText" type="password" style={{flex: 1}} id="user_new_password" name="user_new_password" autoComplete="new-password" value={this.state.user_new_password} onChange={(event) => this.setState({user_new_password: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Nové heslo znovu:*</span>
                                <input className="profileTileInputText" type="password" style={{flex: 1}} id="user_new_password_two" name="user_new_password_two" autoComplete="new-password" value={this.state.user_new_password_two} onChange={(event) => this.setState({user_new_password_two: event.target.value})}/>
                            </div>

                            <div style={{height: 15}}></div>

                            <div className="horizontalStack">
                                <RoundButton title={"Změnit heslo"} style={{color: "white", backgroundColor: "#d4daf9"}} onClick={() => this.saveNewPassword()} whiteText={false} />
                            </div>
                        </div>
                    </div>

                    <div className="universalTile" style={{display: this.isTeamLeader(this.state.roles_array) ? "" : "none"}}>
                        <span className="fontPoppinsSemiBold15">{"Údaje hudebního seskupení (pouze pro vedoucího týmu)"}</span>
                        <div style={{height: 10}}></div>

                        <div className="verticalStack" style={{padding: 12, backgroundColor: "#F4F4F8"}}>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Název:*</span>
                                <input className="profileTileInputText" type="text" style={{flex: 1}} id="inputFirstName" name="inputFirstName" value={this.state.team_name} onChange={(event) => this.setState({team_name: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Kód pro členy týmu:*</span>
                                <input className="profileTileInputText" type="text" style={{flex: 1}} id="inputFirstName" name="inputFirstName" value={this.state.team_code} onChange={(event) => this.setState({team_code: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="horizontalStack">
                                <RoundButton title={"Uložit změny"} style={{color: "white", backgroundColor: "#d4daf9"}} onClick={() => this.saveBasicTeamInfo()} whiteText={false} />
                            </div>

                            <div style={{height: 20}}></div>

                            <span className="fontPoppinsRegular13" style={{marginBottom: 0}}>Členové týmu:</span>

                            <div style={{height: 10}}></div>

                            <div className="horizontalStack flex" style={{backgroundColor: "white", paddingTop: 10, overflowX: "visible", flexWrap: "wrap"}}>

                                {this.state.team_members.map(function (item) {
                                    return (
                                        <div style={{marginBottom: 10}}>
                                            {item.id_musician == this.state.user_id ? <label className="fontPoppinsRegular13" style={{marginLeft: 10, marginBottom: 10, border: "1px solid #495057", color: "#495057", whiteSpace: "nowrap", borderRadius: 5, paddingLeft: 5, paddingRight: 5}}>{item.name} {item.surname}</label> : null }
                                            {item.id_musician != this.state.user_id ? <label className="fontPoppinsRegular13 clickable" onClick={() => this.deleteMemberFromTeam(item.id_musician)} style={{marginLeft: 10, marginBottom: 10, border: "1px solid #556EE6", color: "#556EE6", whiteSpace: "nowrap", borderRadius: 5, paddingLeft: 5, paddingRight: 5}}>{item.name} {item.surname} {"x"}</label> : null }
                                        </div>
                                    )
                                }.bind(this))}

                            </div>
                        </div>
                    </div>

                    {/*<div className="universalTile">
                        <span className="fontPoppinsSemiBold15">{"Změna hudebního seskupení"}</span>
                        <br/>
                        <span className="fontPoppinsRegular13Gray">{"Upozornění: Změnou hudebního seskupení přestaneme mít přístup ke všem společným písním, playlistům a úkolům!"}</span>
                        <div style={{height: 10}}></div>

                        <div className="verticalStack" style={{padding: 12, backgroundColor: "#F4F4F8"}}>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Kód nového seskupení:*</span>
                                <input className="profileTileInputText" type="text" style={{width: "100%"}} id="inputFirstName" name="inputFirstName" value={this.state.first_na}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="horizontalStack">
                                <RoundButton title={"Změnit hudební seskupení"} style={{color: "white", backgroundColor: "#d4daf9"}} onClick={this.createNewAction} whiteText={false} />
                            </div>
                        </div>
                    </div>*/}

                    <div style={{height: 20}}></div>
                </div>
            </div>
        );
    }
}

export default Account;
