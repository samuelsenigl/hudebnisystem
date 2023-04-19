import React, { useState, useEffect } from "react";
import '../styles/tiles.css';
import '../styles/other.css';
import { Link, Navigate } from "react-router-dom";

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

    openSongPage = (id) => {
        this.setState({ redirectTo: "/Song?id="+id });
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
                                {this.state.windowHeight >= 900 ? <td className="listTableHeader listTableNameHeader">Název písně</td> : null }
                                {this.state.windowHeight < 900 ? <td className="listTableHeader listTableHeaderOther">Název písně</td> : null }
                                {this.state.windowHeight >= 900 ? <td className="listTableHeader listTableHeaderRole">Autor</td> : null }
                                {this.state.windowHeight >= 900 ? <td className="listTableHeader listTableHeaderOther">Capo</td> : null }
                                {this.state.windowHeight >= 900 ? <td className="listTableHeader listTableHeaderOther">Tempo</td> : null }
                                {this.state.windowHeight >= 900 ? <td className="listTableHeader listTableHeaderOther">Tónina</td> : null }
                                {this.state.windowHeight >= 900 ? <td className="listTableHeader listTableHeaderOther">Společná poznámka</td> : null }
                            </tr>

                            {this.props.songsArray.map(function (item) {
                                return (
                                    <tr key={item.id} onClick={() => this.openSongPage(item.id_song)}>
                                        {this.state.windowHeight >= 900 ? <td className="horizontalStackCenter listTableName listTableNameDiv listTableFirstFixedColumn" nowrap="nowrap"><span>{item.title}</span></td> : null }
                                        {this.state.windowHeight < 900 ? <td className="listTableGeneralDiv" nowrap="nowrap">{item.title}</td> : null }
                                        {this.state.windowHeight >= 900 ? <td className="listTableGeneralDiv" nowrap="nowrap">{item.author}</td> : null }
                                        {this.state.windowHeight >= 900 ? <td className="listTableGeneralDiv" nowrap="nowrap">{item.capo}</td> : null }
                                        {this.state.windowHeight >= 900 ? <td className="listTableGeneralDiv" nowrap="nowrap">{item.tempo}</td> : null }
                                        {this.state.windowHeight >= 900 ? <td className="listTableGeneralDiv" nowrap="nowrap">{item.song_key}</td> : null }
                                        {this.state.windowHeight >= 900 ? <td className="listTableGeneralDiv" nowrap="nowrap">{item.shared_note}</td> : null }
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
