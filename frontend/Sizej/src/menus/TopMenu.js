import React, { useState, useEffect } from "react";
import '../styles/other.css';
import '../styles/menus.css';
import { Link } from "react-router-dom";
import Axios from 'axios';

// import utilities
import { checkForErrorsInRequest } from '../utilities/RequestsUtilities.js';

// import components
import RoundButton from '../components/RoundButton.js';

// import assets
import icon_add from '../assets/icon_add.png';
import icon_playlist from '../assets/icon_playlist.png';
import icon_songs from '../assets/icon_songs.png';
import icon_tasks from '../assets/icon_tasks.png';
import logo from '../assets/logo.png';
import logo2 from '../assets/logo2.png';

class TopMenu extends React.Component {
    setActualSection = this.props.setActualSection;

    constructor(props) {
        super(props);

        this.state = {
            name: "User",
            surname: "Name",
            windowHeight: 1000,
        };
    }

    async componentDidMount(){
        this.loadData();
        window.addEventListener('resize', this.checkTopMenuResponsivity);

        this.checkTopMenuResponsivity();
        await new Promise(resolve => setTimeout(resolve, 50));
        this.checkTopMenuResponsivity();
    }

    loadData = async () => {
        Axios.get('/api/users/logged').then(response => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }

            this.setState({ name: response.data.result[0].name  });
            this.setState({ surname: response.data.result[0].surname  });
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.checkTopMenuResponsivity);
    }

    checkTopMenuResponsivity = () => {
        this.setState({ windowHeight: window.innerWidth });
    }

    isSongsActive(actualSection){
        if(actualSection == "songs"){ return true; }
        else { return false; }
    }

    isPlaylistsActive(actualSection){
        if(actualSection == "playlists"){ return true; }
        else { return false; }
    }

    isTasksActive(actualSection){
        if(actualSection == "tasks"){ return true; }
        else { return false; }
    }

    logoutUser = () => {
        localStorage.setItem("saved_token", "");
        window.location.reload();
    }

    render(){
        return(
            <div className="verticalStack">

            {this.state.windowHeight >= 900 ?
                <div className="mainTopMenu horizontalStackCenter">
                        <div onClick={() => this.setActualSection("homepage")}>
                            <Link className="link" to={"./"} >
                                <img style={{height: "50px"}} src={logo2}/>
                            </Link>
                        </div>
                        <div style={{width: 10}}></div>
                        <div onClick={() => this.setActualSection("homepage")}>
                            <Link className="link" to={"./"} >
                                <span className="logoText clickable">{"Sizej Web"}</span>
                            </Link>
                        </div>
                        <div style={{width: 30}}></div>
                        <div onClick={() => this.setActualSection("songs")}>
                            <Link className="link" to={"./Songs"} >
                                <RoundButton title={"Písně"} icon={icon_songs} style={{backgroundColor: this.isSongsActive(this.props.actualSection) ? "#e8eafb" : ""}} />
                            </Link>
                        </div>
                        <div style={{width: 10}}></div>
                        <div onClick={() => this.setActualSection("playlists")}>
                            <Link className="link" to={"./Playlists"} >
                                <RoundButton title={"Playlisty"} icon={icon_playlist} style={{backgroundColor: this.isPlaylistsActive(this.props.actualSection) ? "#e8eafb" : ""}} />
                            </Link>
                        </div>
                        <div style={{width: 10}}></div>
                        <div onClick={() => this.setActualSection("tasks")}>
                            <Link className="link" to={"./Tasks"} >
                                <RoundButton title={"Úkoly"} icon={icon_tasks} style={{backgroundColor: this.isTasksActive(this.props.actualSection) ? "#e8eafb" : ""}} />
                            </Link>
                        </div>

                        <div className="flex"/>
                        <div className="horizontalStackCenter addNewButtonDropdownContainer" style={{marginRight: "23px"}}>
                            <div className="addNewButtonDropdownVisible">
                                <RoundButton title={"Vytvořit"} icon={icon_add} />
                            </div>

                            <div className="verticalStackCenter addNewButtonDropdownHidden">

                                <div className="verticalStackCenter" style={{padding: 16}}>

                                    <div className="verticalStack">
                                        <Link className="link" to={"./NewSong"} >
                                            <span className="fontPoppinsSemiBold15Black clickable onHoverToOrange">Píseň</span>
                                        </Link>
                                        <div style={{height: 5}}></div>
                                        <Link className="link" to={"./NewPlaylist"} >
                                            <span className="fontPoppinsSemiBold15Black clickable onHoverToOrange">Playlist</span>
                                        </Link>
                                        <div style={{height: 5}}></div>
                                        <Link className="link" to={"./NewTask"} >
                                            <span className="fontPoppinsSemiBold15Black clickable onHoverToOrange">Úkol</span>
                                        </Link>
                                    </div>

                                </div>

                            </div>
                        </div>

                        <div style={{width: "2px", height: "100%", backgroundColor: "#f4f4f8"}}/>

                        <div className="topMenuUserButtonDropdownContainer">

                            <div className="topMenuUserButtonDropdownVisible">
                                <div className="horizontalStackCenter topMenuUserButton">
                                    <span className="fontPoppinsRegular13" style={{paddingRight: "12.5px", paddingLeft: "24.5px"}}>{this.state.name} {this.state.surname}</span>
                                </div>
                            </div>

                            <div className="topMenuUserButtonDropdownHidden">

                                <div onClick={() => this.setActualSection("account")}>
                                    <Link className="link" to={"./Account"} >
                                        <div className="flex horizontalStackCenter topMenuUserButtonDropdownRow">
                                            <span className="fontPoppinsRegular13DarkGray">{"Zobrazit profil"}</span>
                                            <div class="flex"></div>
                                        </div>
                                    </Link>
                                </div>

                                <div onClick={() => {this.setActualSection("statistics");alert("Tato stránka prozatím neexistuje.")}}>
                                    <div className="flex horizontalStackCenter topMenuUserButtonDropdownRow">
                                        <span className="fontPoppinsRegular13DarkGray">{"Statistiky"}</span>
                                        <div class="flex"></div>
                                    </div>
                                </div>

                                <div className="topMenuUserButtonDropdownRow">
                                    <span className="fontPoppinsRegular13DarkGray" onClick={this.logoutUser}>{"Odhlásit se"}</span>
                                    <div class="flex"></div>
                                </div>

                            </div>
                        </div>
                </div>
            : null }

            {this.state.windowHeight < 900 ?
                <div className="mainTopMenu horizontalStackCenter">
                        <div onClick={() => this.setActualSection("homepage")}>
                            <Link className="link" to={"./"} >
                                <img style={{height: "50px"}} src={logo2}/>
                            </Link>
                        </div>
                        <div style={{width: 30}}></div>

                        <div onClick={() => this.setActualSection("songs")}>
                            <Link className="link" to={"./Songs"} >
                                <div className="circleButtonTransposeContainer clickable" style={{backgroundColor: this.isSongsActive(this.props.actualSection) ? "#e8eafb" : "#d4daf9"}}>
                                    <img className="circleButton" style={{height: "16px"}} src={icon_songs}/>
                                </div>
                            </Link>
                        </div>

                        <div style={{width: 10}}></div>
                        <div onClick={() => this.setActualSection("playlists")}>
                            <Link className="link" to={"./Playlists"} >
                                <div className="circleButtonTransposeContainer clickable" style={{backgroundColor: this.isPlaylistsActive(this.props.actualSection) ? "#e8eafb" : "#d4daf9"}}>
                                    <img className="circleButton" style={{height: "16px"}} src={icon_playlist}/>
                                </div>
                            </Link>
                        </div>
                        <div style={{width: 10}}></div>
                        <div onClick={() => this.setActualSection("tasks")}>
                            <Link className="link" to={"./Tasks"} >
                                <div className="circleButtonTransposeContainer clickable" style={{backgroundColor: this.isTasksActive(this.props.actualSection) ? "#e8eafb" : "#d4daf9"}}>
                                    <img className="circleButton" style={{height: "16px"}} src={icon_tasks}/>
                                </div>
                            </Link>
                        </div>
                        <div style={{width: 10}}></div>

                        <div className="flex"/>
                        <div className="horizontalStackCenter addNewButtonDropdownContainer" style={{marginRight: "23px"}}>
                            <div className="addNewButtonDropdownVisible">
                                <div className="circleButtonTransposeContainer clickable" style={{backgroundColor: "#d4daf9"}}>
                                    <img className="circleButton" style={{height: "16px"}} src={icon_add}/>
                                </div>
                            </div>

                            <div className="verticalStackCenter addNewButtonDropdownHidden">

                                <div className="verticalStackCenter" style={{padding: 16}}>

                                    <div className="verticalStack">
                                        <Link className="link" to={"./NewSong"} >
                                            <span className="fontPoppinsSemiBold15Black clickable onHoverToOrange">Píseň</span>
                                        </Link>
                                        <div style={{height: 5}}></div>
                                        <Link className="link" to={"./NewPlaylist"} >
                                            <span className="fontPoppinsSemiBold15Black clickable onHoverToOrange">Playlist</span>
                                        </Link>
                                        <div style={{height: 5}}></div>
                                        <Link className="link" to={"./NewTask"} >
                                            <span className="fontPoppinsSemiBold15Black clickable onHoverToOrange">Úkol</span>
                                        </Link>
                                    </div>

                                </div>

                            </div>
                        </div>

                        <div style={{width: "2px", height: "100%", backgroundColor: "#f4f4f8"}}/>

                        <div className="topMenuUserButtonDropdownContainer">

                            <div className="topMenuUserButtonDropdownVisible">
                                <div className="horizontalStackCenter topMenuUserButton clickable">
                                    <span className="fontPoppinsRegular13" style={{paddingRight: "12.5px", paddingLeft: "24.5px"}}>{this.state.name[0]}. {this.state.surname[0]}.</span>
                                </div>
                            </div>

                            <div className="topMenuUserButtonDropdownHidden">

                                <div onClick={() => this.setActualSection("account")}>
                                    <Link className="link" to={"./Account"} >
                                        <div className="flex horizontalStackCenter topMenuUserButtonDropdownRow">
                                            <span className="fontPoppinsRegular13DarkGray">{"Profil"}</span>
                                            <div class="flex"></div>
                                        </div>
                                    </Link>
                                </div>

                                <div onClick={() => {this.setActualSection("statistics");alert("Tato stránka prozatím neexistuje.")}}>
                                    <div className="flex horizontalStackCenter topMenuUserButtonDropdownRow">
                                        <span className="fontPoppinsRegular13DarkGray">{"Statistiky"}</span>
                                        <div class="flex"></div>
                                    </div>
                                </div>

                                <div className="topMenuUserButtonDropdownRow">
                                    <span className="fontPoppinsRegular13DarkGray" onClick={this.logoutUser}>{"Odhlásit"}</span>
                                    <div class="flex"></div>
                                </div>

                            </div>
                        </div>
                </div>
            : null }
            </div>
        );
	}
}

export default TopMenu;