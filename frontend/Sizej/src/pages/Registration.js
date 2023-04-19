import React, { useState, useEffect } from "react";
import '../styles/other.css';
import '../styles/pages.css';
import Axios from 'axios';
import { Link, Navigate } from "react-router-dom";

// import components
import RoundButton from '../components/RoundButton.js';

// import utilities
import { checkForErrorsInRequest } from '../utilities/RequestsUtilities.js';

class HomePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            redirectTo: null,
            registrationType: "", // newTeam, joinTeam, default is empty
            teamName: "",
            teamCode: "",
            userEmail: "",
            userName: "",
            userSurname: "",
            userPasswordOne: "",
            userPasswordTwo: "",
            userGdprAgreement: false,
        }
    }

    componentDidMount(){
        this.setState({ redirectTo: null });
    }

    openLoginPage = () => {
        window.location.href = "/Login";
    }

    isValidEmail(email) {
        return /\S+@\S+\.\S+/.test(email);
    }

    onNewTeamRegistration = () => {
        if(this.state.teamName == ""){ alert("Je potřeba vyplnit název týmu."); return; }
        else if(this.state.teamCode == ""){ alert("Je potřeba vyplnit join kód."); return; }
        else if(this.state.teamCode.includes(" ")){ alert("Join kód nesmí obsahovat mezery."); return; }
        else if(this.state.userEmail == ""){ alert("Je potřeba vyplnit váš email."); return; }
        else if(!this.isValidEmail(this.state.userEmail)){ alert("Váš zadaný email není validní."); return; }
        else if(this.state.userName == ""){ alert("Je potřeba vyplnit vaše jméno."); return; }
        else if(this.state.userSurname == ""){ alert("Je potřeba vyplnit vaše přijmení."); return; }
        else if(this.state.userPasswordOne == ""){ alert("Je potřeba vyplnit vaše heslo."); return; }
        else if(this.state.userPasswordTwo == ""){ alert("Je potřeba vyplnit vaše heslo podruhé."); return; }
        else if(this.state.userPasswordOne !== this.state.userPasswordTwo){ alert("Vaše hesla se neshodují."); return; }
        else if(!this.state.userGdprAgreement){ alert("Je potřeba souhlasit se zpracováním osobních údajů."); return; }

        Axios.post("/api/registration/new", {
            team_name: this.state.teamName,
            team_code: this.state.teamCode,
            user_email: this.state.userEmail,
            user_name: this.state.userName,
            user_surname: this.state.userSurname,
            user_password: this.state.userPasswordOne,
        }).then((response) => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }

            if(response.data.registrationWasSuccessful == 1){
                this.openLoginPage();
            }
            else {
                console.log("Error: "+response.data.errMessage);
                alert(response.data.errMessage);
            }
        });
    }

    onJoinTeamRegistration = () => {
        if(this.state.teamCode == ""){ alert("Je potřeba vyplnit join kód."); return; }
        else if(this.state.teamCode.includes(" ")){ alert("Join kód nesmí obsahovat mezery."); return; }
        else if(this.state.userEmail == ""){ alert("Je potřeba vyplnit váš email."); return; }
        else if(!this.isValidEmail(this.state.userEmail)){ alert("Váš zadaný email není validní."); return; }
        else if(this.state.userName == ""){ alert("Je potřeba vyplnit vaše jméno."); return; }
        else if(this.state.userSurname == ""){ alert("Je potřeba vyplnit vaše přijmení."); return; }
        else if(this.state.userPasswordOne == ""){ alert("Je potřeba vyplnit vaše heslo."); return; }
        else if(this.state.userPasswordTwo == ""){ alert("Je potřeba vyplnit vaše heslo podruhé."); return; }
        else if(this.state.userPasswordOne !== this.state.userPasswordTwo){ alert("Vaše hesla se neshodují."); return; }
        else if(!this.state.userGdprAgreement){ alert("Je potřeba souhlasit se zpracováním osobních údajů."); return; }

        Axios.post("/api/registration/join", {
            team_code: this.state.teamCode,
            user_email: this.state.userEmail,
            user_name: this.state.userName,
            user_surname: this.state.userSurname,
            user_password: this.state.userPasswordOne,
        }).then((response) => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }

            if(response.data.registrationWasSuccessful == 1){
                this.openLoginPage();
            }
            else {
                console.log("Error: "+response.data.errMessage);
                alert(response.data.errMessage);
            }
        });

    }


    render() {
        if (this.state.redirectTo) {
            return <Navigate to={this.state.redirectTo} />
        }
        return (
            <div className="loginPage" style={{flexDirection: "column"}}>
                {this.state.registrationType == "" ? <div className="verticalStack">
                    <center>
                        <div className="verticalStack" style={{alignItems: "center", width: "380px"}}>

                            <div className="horizontalStackCenter" style={{width: "100%", marginTop: "24px"}}>
                                <span className="loginPageLoginButton clickable fontPoppinsRegular13" style={{width: "100%"}} onClick={() => this.setState({ registrationType: "newTeam" })}>Vytvořit nový tým</span>
                            </div>

                            <span className="fontPoppinsRegular13White clickable" style={{paddingTop: 10}}>{"(Stanete se vedoucím týmu a budete moct"}<br/>{"pozvat ostatní, aby se do týmu přidali.)"}</span>

                            <div className="horizontalStackCenter" style={{width: "100%", marginTop: "24px"}}>
                                <span className="loginPageLoginButton clickable fontPoppinsRegular13" style={{width: "100%"}} onClick={() => this.setState({ registrationType: "joinTeam" })}>Přidat se do týmu</span>
                            </div>

                            <span className="fontPoppinsRegular13White clickable" style={{paddingTop: 10}}>{"(Přidáte se do týmu, pomocí přístupového"}<br/>{"klíče od vedoucího vašeho týmu.)"}</span>

                        </div>
                    </center>
                </div> : null }


                {this.state.registrationType == "newTeam" ? <div className="verticalStack">
                    <div className="universalTile" style={{alignItems: "center", width: "100%", maxWidth: 400, maxHeight: 600, overflowY: "scroll"}}>
                        <span className="fontPoppinsSemiBold15">{"Nový tým"}</span>
                        <div style={{height: 10}}></div>

                        <div className="verticalStack" style={{padding: 12, backgroundColor: "#F4F4F8"}}>

                            <center><span className="fontPoppinsRegular15" style={{}}>Informace o týmu</span></center>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Název týmu:*</span>
                                <input className="profileTileInputText" type="text" style={{flex: 1}} id="teamName" name="teamName" value={this.state.teamName} onChange={(event) => this.setState({teamName: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Join kód:*</span>
                                <input className="profileTileInputText" type="text" style={{flex: 1}} id="teamCode" name="teamCode" value={this.state.teamCode} onChange={(event) => this.setState({teamCode: event.target.value})}/>
                                <span className="fontPoppinsRegular13" style={{marginTop: 10}}>(Tento kód budou muset zadat vaší členové týmu, aby mohli být přidání k vašemu týmu.)</span>
                                <span className="fontPoppinsRegular13" style={{marginTop: 10}}>(Zadejte prosím bez mezer a háčků a čárek)</span>
                            </div>

                            <div style={{height: 5}}></div>

                        </div>

                        <div className="verticalStack" style={{padding: 12, marginTop: 20, backgroundColor: "#F4F4F8"}}>

                            <center><span className="fontPoppinsRegular15" style={{}}>Váš nový účet vedoucího týmu</span></center>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Email:*</span>
                                <input className="profileTileInputText" type="email" style={{flex: 1}} autoComplete={"new-password"} id="userEmail" name="userEmail" value={this.state.userEmail} onChange={(event) => this.setState({userEmail: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Jméno:*</span>
                                <input className="profileTileInputText" type="text" style={{flex: 1}} autoComplete={"new-password"} id="userName" name="userName" value={this.state.userName} onChange={(event) => this.setState({userName: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Přijmení:*</span>
                                <input className="profileTileInputText" type="text" style={{flex: 1}} autoComplete={"new-password"} id="userSurname" name="userSurname" value={this.state.userSurname} onChange={(event) => this.setState({userSurname: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Heslo:*</span>
                                <input className="profileTileInputText" type="password" style={{flex: 1}} autoComplete={"new-password"} id="userPasswordOne" name="userPasswordOne" value={this.state.userPasswordOne} onChange={(event) => this.setState({userPasswordOne: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Heslo podruhé:*</span>
                                <input className="profileTileInputText" type="password" style={{flex: 1}} autoComplete={"new-password"} id="userPasswordTwo" name="userPasswordTwo" value={this.state.userPasswordTwo} onChange={(event) => this.setState({userPasswordTwo: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="horizontalStack" style={{marginTop: 3, marginBottom: 3}} onChange={(event) => this.setState({userGdprAgreement: !this.state.userGdprAgreement})}>
                                 <input type="checkbox" className="clickable" id="gdpr" name="gdpr" checked={this.state.userGdprAgreement} />
                                <label for={"gdpr"} className="fontPoppinsRegular13" style={{marginLeft: 5}}>{"Souhlasím se zpracováním osobních údajů"}</label>
                            </div>

                            <div style={{height: 15}}></div>

                            <div className="horizontalStack" style={{justifyContent: "center"}}>
                                <RoundButton title={"Vytvořit nový tým a váš účet"} style={{color: "white", backgroundColor: "#ff6600"}} onClick={() => this.onNewTeamRegistration()} whiteText={true} />
                            </div>

                        </div>

                    </div>
                </div> : null }


                {this.state.registrationType == "joinTeam" ? <div className="verticalStack">
                    <div className="universalTile" style={{alignItems: "center", width: "100%", maxWidth: 400, maxHeight: 600, overflowY: "scroll"}}>
                        <span className="fontPoppinsSemiBold15">{"Připojit se k týmu"}</span>
                        <div style={{height: 10}}></div>

                        <div className="verticalStack" style={{padding: 12, backgroundColor: "#F4F4F8"}}>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Join kód:*</span>
                                <input className="profileTileInputText" type="text" style={{flex: 1}} id="teamCode" name="teamCode" value={this.state.teamCode} onChange={(event) => this.setState({teamCode: event.target.value})}/>
                                <span className="fontPoppinsRegular13" style={{marginTop: 10}}>(Tento kód by vám měl sdělit váš vedoucí týmu.)</span>
                            </div>

                            <div style={{height: 5}}></div>

                        </div>

                        <div className="verticalStack" style={{padding: 12, marginTop: 20, backgroundColor: "#F4F4F8"}}>

                            <center><span className="fontPoppinsRegular15" style={{}}>Váš nový účet člena týmu</span></center>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Email:*</span>
                                <input className="profileTileInputText" type="email" style={{flex: 1}} autoComplete={"new-password"} id="userEmail" name="userEmail" value={this.state.userEmail} onChange={(event) => this.setState({userEmail: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Jméno:*</span>
                                <input className="profileTileInputText" type="text" style={{flex: 1}} autoComplete={"new-password"} id="userName" name="userName" value={this.state.userName} onChange={(event) => this.setState({userName: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Přijmení:*</span>
                                <input className="profileTileInputText" type="text" style={{flex: 1}} autoComplete={"new-password"} id="userSurname" name="userSurname" value={this.state.userSurname} onChange={(event) => this.setState({userSurname: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Heslo:*</span>
                                <input className="profileTileInputText" type="password" style={{flex: 1}} autoComplete={"new-password"} id="userPasswordOne" name="userPasswordOne" value={this.state.userPasswordOne} onChange={(event) => this.setState({userPasswordOne: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="verticalStack">
                                <span className="fontPoppinsRegular13" style={{marginBottom: 10}}>Heslo podruhé:*</span>
                                <input className="profileTileInputText" type="password" style={{flex: 1}} autoComplete={"new-password"} id="userPasswordTwo" name="userPasswordTwo" value={this.state.userPasswordTwo} onChange={(event) => this.setState({userPasswordTwo: event.target.value})}/>
                            </div>

                            <div style={{height: 10}}></div>

                            <div className="horizontalStack" style={{marginTop: 3, marginBottom: 3}} onChange={(event) => this.setState({userGdprAgreement: !this.state.userGdprAgreement})}>
                                 <input type="checkbox" className="clickable" id="gdpr" name="gdpr" checked={this.state.userGdprAgreement} />
                                <label for={"gdpr"} className="fontPoppinsRegular13" style={{marginLeft: 5}}>{"Souhlasím se zpracováním osobních údajů"}</label>
                            </div>

                            <div style={{height: 15}}></div>

                            <div className="horizontalStack" style={{justifyContent: "center"}}>
                                <RoundButton title={"Vytvořit účet a připojit se k týmu"} style={{color: "white", backgroundColor: "#ff6600"}} onClick={() => this.onJoinTeamRegistration()} whiteText={true} />
                            </div>

                        </div>

                    </div>
                </div> : null }


                <div className="horizontalStackCenter" style={{width: "100%", marginTop: "24px"}}>
                    <div className="flex"></div>
                    <span className="fontPoppinsRegular13White clickable" onClick={() => this.openLoginPage()}>Zpět na Login stránku</span>
                    <div className="flex"></div>
                </div>

            </div>
        );
    }
}

export default HomePage;
