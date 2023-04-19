import React, { useState, useEffect } from "react";
import '../styles/other.css';
import '../styles/pages.css';
import Axios from 'axios';
import { Link, Navigate } from "react-router-dom";

// import components
import RoundButton from '../components/RoundButton.js';

// import utilities
import { checkForErrorsInRequest } from '../utilities/RequestsUtilities.js';

// import assets
import logo2 from '../assets/logo2.png';

class HomePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            redirectTo: null,
        }
    }

    componentDidMount(){
        this.setState({ redirectTo: null });
    }

    openLogin = () => {
        window.location.href = "/Login";
    }


    render() {
        if (this.state.redirectTo) {
            return <Navigate to={this.state.redirectTo} />
        }
        return (
            <div className="verticalStack flex" style={{height: "100vh", backgroundColor: "#f4f4f8", overflowY: "scroll"}}>
                <div className="mainTopMenu horizontalStackCenter">

                    <img style={{height: "50px"}} src={logo2}/>

                    <div style={{width: 10}}></div>

                    <span className="logoText">{"Sizej Web"}</span>

                    <div className="flex"/>

                    <RoundButton title={"Přihlásit se"} style={{marginRight: 20}} onClick={() => this.openLogin()} />
                </div>

                <div className="universalTile" style={{marginRight: 20, marginLeft: 20}}>
                    <div className="verticalStack">
                        <span className="fontPoppinsSemiBold15Blue">{"Co je Sizej web"}</span>
                        <span className="fontPoppinsRegular13" style={{width: "75%"}}>{"Sizej web je webový systém jehož posláním je podpořit, zjednodušit a zpřehlednit fungování kapel, hudebních týmů, apod."}</span>
                    </div>
                    <div className="verticalStack" style={{marginTop: 20}}>
                        <span className="fontPoppinsSemiBold15Blue">{"Jak začít Sizej web používat"}</span>
                        <span className="fontPoppinsRegular13" style={{width: "75%"}}>{"Nejprve na tomto webu založí účet vedoucí vašeho týmu a vytvoří pro vás tým. Poté vedoucí pošle ostatním klíč. Ostatní členové si vytvoří účet a pomocí klíče se při registraci připojí k týmu, který vytvořil jejich vedoucí."}</span>
                    </div>
                    <div className="verticalStack" style={{marginTop: 20}}>
                        <span className="fontPoppinsSemiBold15Blue">{"S čím může Sizej web pomoci?"}</span>
                        <span className="fontPoppinsRegular13" style={{width: "75%"}}>{"Můžete si na Sizej webu ukládat své "}<span className="fontPoppinsSemiBold13">{"písně"}</span>{", které hrajete. Dále také vytvářet "}<span className="fontPoppinsSemiBold13">{"playlisty"}</span>{" a sdílet mezi sebou "}<span className="fontPoppinsSemiBold13">{"úkoly"}</span>{"."}</span>
                        <div style={{height: 10}}></div>
                        <div className="verticalStack" style={{marginLeft: 20, marginRight: 20}}>
                            <span className="fontPoppinsSemiBold15">{"• Písně"}</span>
                            <span className="fontPoppinsRegular13" style={{marginLeft: 10}}>{"Můžete si ukládat své písně do systému a uvidí je všichni členové vašeho týmu. Písně můžete transponovat, ukládat si k nim různé údaje jako je výše kapodastru, tónina, tempo a podobně. Ke každé písni si můžete napsat sdílenou poznámku, ale i každý člen týmu si může psát své osobní poznámky, které nebudou viditelné ostatním členům týmu."}</span>
                            <div style={{height: 10}}></div>
                            <span className="fontPoppinsSemiBold15">{"• Playlisty"}</span>
                            <span className="fontPoppinsRegular13" style={{marginLeft: 10}}>{"Playlist je sada více písní, které váš tým hraje. Například pokud se připravujete na to, že budete někde hrát, můžete vytvořit playlist a uložit si kdo bude hrát, jaké písně budete hrát a kde a kdy budete hrát."}</span>
                            <div style={{height: 10}}></div>
                            <span className="fontPoppinsSemiBold15">{"• Úkoly"}</span>
                            <span className="fontPoppinsRegular13" style={{marginLeft: 10}}>{"Můžete si mezi sebou posílat úkoly a v nich popisovat co se má kdo naučit. Úkoly můžete sdílet s jedním či více lidmi ve vašem týmu a můžete u nich nastavit v jakém jsou stavu."}</span>
                        </div>
                    </div>
                </div>

                <div className="universalTile" style={{marginRight: 20, marginLeft: 20, marginBottom: 20}}>
                    <div className="verticalStack">
                        <span className="fontPoppinsSemiBold15Blue">{"Kontakt"}</span>
                        <span className="fontPoppinsRegular13" style={{width: "75%"}}>{"Jméno: Samuel Šenigl"}</span>
                        <span className="fontPoppinsRegular13" style={{width: "75%"}}>{"Tel.: 775 972 385"}</span>
                        <span className="fontPoppinsRegular13" style={{width: "75%"}}>{"Email: sizejweb@seznam.cz"}</span>
                    </div>
                </div>

            </div>
        );
    }
}

export default HomePage;
