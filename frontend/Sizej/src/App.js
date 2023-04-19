import React, { useState, useEffect } from "react";
import {BrowserRouter, Routes, Route, Link } from "react-router-dom";
//import './App.css';
import './styles/other.css';
import CookieConsent from "react-cookie-consent";

//components
import TopMenu from "./menus/TopMenu.js";
import AlertModalMessage from './modals/AlertModalMessage.js';

//pages
import HomePage from "./pages/HomePage.js";
import Login from "./pages/Login.js";
import Songs from "./pages/Songs.js";
import Song from "./pages/Song.js";
import Playlists from "./pages/Playlists.js";
import Playlist from "./pages/Playlist.js";
import PlaylistRun from "./pages/PlaylistRun.js";
import Tasks from "./pages/Tasks.js";
import Task from "./pages/Task.js";
import NewSong from "./pages/NewSong.js";
import NewTask from "./pages/NewTask.js";
import NewPlaylist from "./pages/NewPlaylist.js";
import Account from "./pages/Account.js";
import Promo from "./pages/Promo.js";
import Registration from "./pages/Registration.js";
import ForgotPassword from "./pages/ForgotPassword.js";

function setToken(userToken) {
    localStorage.setItem('saved_token', userToken);
};

function getToken() {
    try {
        const token = localStorage.getItem('saved_token');
        if(token == ""){return null;}
        //console.log(token);
        return token
    }
    catch(err){
        return null;
    }
};

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            actualSection: "none",
            leftMenuOpened: "true",
            searchText: "",
            prepareToShowAlertModalMessage: false,
            showAlertModalMessage: false,
            alertMessage: "Message",
            alertCloseButton: "OK",
        };
    }


    componentDidMount(){
        this.setState({ actualSection: localStorage.getItem("actualSection") || "none" });
    }

    setActualSection = (newActualSection) => {
        this.setState({ searchText: "" });
        this.setState({ actualSection: newActualSection });
        localStorage.setItem("actualSection", newActualSection);
    }

    setLeftMenuOpened = (isOpened) => {
        this.setState({ leftMenuOpened: isOpened });
    }

    logoutUser = () => {
        setToken(null);
        window.location.reload();
    }

    setSearchText = (textToSearch) => {
        this.setState({ searchText: textToSearch });
    }

    openAlertMessage = async (message, closeButton) => {
        await this.setState({ alertMessage: message });
        await this.setState({ alertCloseButton: closeButton });
        await this.setState({ prepareToShowAlertModalMessage: true });
        this.setState({ showAlertModalMessage: true });
    }

    closeAlertMessage = async () => {
        this.setState({ showAlertModalMessage: false });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.setState({ prepareToShowAlertModalMessage: false });
    }

    render() {
        const token = getToken();
        if(window.location.pathname == "/Promo") { return <Promo /> }
        if(window.location.pathname == "/Registration") { return <Registration /> }
        if(window.location.pathname == "/ForgotPassword") { return <ForgotPassword /> }
        if(!token) { return <Login setToken={setToken} /> }
        console.log(token);

        return (
            <BrowserRouter>
                <div className="horizontalStack" style={{height: "100%", minHeight: "100vh" , backgroundColor: "black"}}>

                    <div className="flex" style={{backgroundColor: "#f4f4f8"}}>

                        <TopMenu searchText={this.state.searchText} setSearchText={this.setSearchText} actualSection={this.state.actualSection} setActualSection={this.setActualSection} />

                        <Routes>
                            <Route exact path="/" element={<HomePage />} />
                            <Route exact path="/Songs" element={<Songs searchText={this.state.searchText} setSearchText={this.setSearchText} />} />
                            <Route exact path="/Playlists" element={<Playlists searchText={this.state.searchText} setSearchText={this.setSearchText} />} />
                            <Route exact path="/Tasks" element={<Tasks searchText={this.state.searchText} setSearchText={this.setSearchText} />} />
                            <Route exact path="/Song" element={<Song />} />
                            <Route exact path="/Playlist" element={<Playlist />} />
                            <Route exact path="/PlaylistRun" element={<PlaylistRun />} />
                            <Route exact path="/Task" element={<Task />} />
                            <Route exact path="/NewSong" element={<NewSong />} />
                            <Route exact path="/NewTask" element={<NewTask />} />
                            <Route exact path="/NewPlaylist" element={<NewPlaylist />} />
                            <Route exact path="/Account" element={<Account openAlertMessage={this.openAlertMessage} />} />
                            <Route exact path="/Promo" element={<Promo />} />
                        </Routes>

                        {this.state.prepareToShowAlertModalMessage ? <AlertModalMessage showModal={this.state.showAlertModalMessage} closeModal={this.closeAlertMessage} message={this.state.alertMessage} closeButton={this.state.alertCloseButton} /> : null }

                    </div>

                    <CookieConsent
                        location="bottom"
                        buttonText="Povolit"
                        cookieName="cookieConsent"
                        style={{ background: "#556EE6" }}
                        buttonStyle={{ fontFamily: "PoppinsRegular", color: "black", background: "#d4daf9", fontSize: "13px", borderRadius: 20 }}
                        expires={150}>
                            <span className="fontPoppinsRegular13White">Kliknutím na „Povolit“ dáváte souhlas se zpracováním cookies a dalších osobních údajů.</span>{" "}
                            {/*<span style={{ fontSize: "10px" }}>This bit of text is smaller</span>*/}
                    </CookieConsent>

                </div>
            </BrowserRouter>
        );
    }
}

export default App;
