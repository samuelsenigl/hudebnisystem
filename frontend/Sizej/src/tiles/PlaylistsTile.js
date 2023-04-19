import React, { useState, useEffect } from "react";
import '../styles/tiles.css';
import '../styles/other.css';
import { Link, Navigate } from "react-router-dom";
import Moment from 'react-moment';

class SongsTile extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            redirectTo: null,
            windowHeight: 1000,
        }
    }

    async componentDidMount(){
        this.setState({ redirectTo: null });
        window.addEventListener('resize', this.checkWindowWidth);

        this.checkWindowWidth();
        await new Promise(resolve => setTimeout(resolve, 50));
        this.checkWindowWidth();
    }

    componentWillUnmount() { window.removeEventListener('resize', this.checkWindowWidth); }
    checkWindowWidth = () => { this.setState({ windowHeight: window.innerWidth }); }

    openPlaylistProfilePage = (id) => {
        this.setState({ redirectTo: "/Playlist?id="+id });
    }

    render() {
        if (this.state.redirectTo) {
            return <Navigate to={this.state.redirectTo} />
        }

        return (
            <div style={{height: "calc(100% - 60px)", width: "100%"}}>
                <div className="listTile">
                    <div style={{width: "calc(100% - 80px)", height: "calc(100% - 300px)", position: "absolute", overflowX: "auto", overflowY: "auto"}}> {/* 240px including the padding */}
                        <table className="listTable">
                            <tr>
                                {this.state.windowHeight >= 900 ? <td className="listTableHeader listTableNameHeader">Název události</td> : null }
                                {this.state.windowHeight < 900 ? <td className="listTableHeader listTableHeaderOther">Název události</td> : null }
                                {this.state.windowHeight >= 900 ? <td className="listTableHeader listTableHeaderRole">Sestava</td> : null }
                                {this.state.windowHeight >= 900 ? <td className="listTableHeader listTableHeaderOther">Adresa</td> : null }
                                {this.state.windowHeight >= 900 ? <td className="listTableHeader listTableHeaderOther">Datum a čas</td> : null }
                                {this.state.windowHeight >= 900 ? <td className="listTableHeader listTableHeaderOther">Poznámka</td> : null }
                            </tr>

                            {this.props.playlistsArray.map(function (item) {
                                return (
                                    <tr key={item.id} onClick={() => this.openPlaylistProfilePage(item.id_playlist)}>
                                        {this.state.windowHeight >= 900 ? <td className="horizontalStackCenter listTableName listTableNameDiv listTableFirstFixedColumn" nowrap="nowrap"><span>{item.event_name}</span></td> : null }
                                        {this.state.windowHeight < 900 ? <td className="listTableGeneralDiv" nowrap="nowrap">{item.event_name}</td> : null }
                                        {this.state.windowHeight >= 900 ? <td className="listTableGeneralDiv" nowrap="nowrap">{item.members}</td> : null }
                                        {this.state.windowHeight >= 900 ? <td className="listTableGeneralDiv" nowrap="nowrap">{item.address}</td> : null }
                                        {this.state.windowHeight >= 900 ? <td className="listTableGeneralDiv" nowrap="nowrap"><Moment format="D. M. YYYY v HH:mm">{item.date_time}</Moment></td> : null }
                                        {this.state.windowHeight >= 900 ? <td className="listTableGeneralDiv" nowrap="nowrap">{item.notes}</td> : null }
                                    </tr>
                                )
                            }.bind(this))}

                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default SongsTile;
