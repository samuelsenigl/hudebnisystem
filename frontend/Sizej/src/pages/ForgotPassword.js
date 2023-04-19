import React, { useState, useEffect } from "react";
import '../styles/other.css';
import '../styles/pages.css';
import Axios from 'axios';
import { Link, Navigate } from "react-router-dom";

// import components
import RoundButton from '../components/RoundButton.js';

// import utilities
import { checkForErrorsInRequest } from '../utilities/RequestsUtilities.js';

class ForgotPassword extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            redirectTo: null,
            email: "",
            join_code: "",
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

    restorePassword = () => {
        if(this.state.email == ""){ alert("Je potřeba vyplnit váš email."); return; }
        else if(!this.isValidEmail(this.state.email)){ alert("Váš zadaný email není validní."); return; }
        else if(this.state.join_code == ""){ alert("Je potřeba vyplnit join kód."); return; }
        else if(this.state.join_code.includes(" ")){ alert("Join kód nesmí obsahovat mezery."); return; }

        //alert("email: "+this.state.email+"\njoin_code: "+this.state.join_code);

        Axios.post("/api/restorePassword", {
            email: this.state.email,
            join_code: this.state.join_code,
        }).then((response) => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }

            if(response.data.restorationWasSuccessful == 1){
                this.openLoginPage();
                alert(response.data.errMessage);
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
                <div className="verticalStack">
                    <center>
                        <div className="verticalStack">
                            <span className="fontPoppinsMedium40White">Obnova hesla</span>
                            <span className="fontPoppinsRegular13White">(Zadejte váš email a join kód vašeho týmu.)</span>
                            <div style={{height: 10}}></div>
                            <span className="fontPoppinsRegular13White">(Na email vám přijde nové heslo, které si po přihlášení<br/>můžete změnit v administraci účtu.)</span>
                        </div>

                        <div className="verticalStack" style={{alignItems: "center", width: "380px"}}>

                            <div style={{width: "100%"}}>

                                <div className="loginPageEmailElement" style={{marginTop: "30px"}}>
                                    <input className="loginPageEmailInput fontPoppinsRegular13" type="email" autoComplete={"new-password"} placeholder="Tvůj email..." onChange={(event) => this.setState({email: event.target.value})} />
                                </div>

                                <div className="horizontalStackCenter loginPagePasswordElement" style={{marginTop: "24px"}}>
                                    <input className="loginPagePasswordInput fontPoppinsRegular13" type="text" autoComplete={"new-password"} placeholder="Join kód vašeho týmu..." onChange={(event) => this.setState({join_code: event.target.value})} />
                                    <button className="loginPageLoginButton clickable" type="submit" onClick={() => this.restorePassword()}><span className="fontPoppinsRegular13">{"Obnovit"}</span></button>
                                </div>

                            </div>

                        </div>
                    </center>
                </div>

                <div className="horizontalStackCenter" style={{width: "100%", marginTop: "24px"}}>
                    <div className="flex"></div>
                    <span className="fontPoppinsRegular13White clickable" onClick={() => this.openLoginPage()}>Zpět na Login stránku</span>
                    <div className="flex"></div>
                </div>

            </div>
        );
    }
}

export default ForgotPassword;
