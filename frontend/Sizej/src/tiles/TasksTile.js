import React, { useState, useEffect } from "react";
import '../styles/tiles.css';
import '../styles/other.css';
import { Link, Navigate } from "react-router-dom";
import Moment from 'react-moment';

class TasksTile extends React.Component {

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

    openTaskPage = (id) => {
        this.setState({ redirectTo: "/Task?id="+id });
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
                                {this.state.windowHeight >= 900 ? <td className="listTableHeader listTableNameHeader">Název úkolu</td> : null }
                                {this.state.windowHeight < 900 ? <td className="listTableHeader listTableHeaderOther">Název úkolu</td> : null }
                                {this.state.windowHeight >= 900 ? <td className="listTableHeader listTableHeaderRole">Datum</td> : null }
                                {this.state.windowHeight >= 900 ? <td className="listTableHeader listTableHeaderOther">Autor</td> : null }
                                {this.state.windowHeight >= 900 ? <td className="listTableHeader listTableHeaderOther">Stav</td> : null }
                            </tr>

                            {this.props.tasksArray.map(function (item) {
                                return (
                                    <tr key={item.id} onClick={() => this.openTaskPage(item.id_task)}>

                                        {this.state.windowHeight >= 900 ? <td className="horizontalStackCenter listTableName listTableNameDiv listTableFirstFixedColumn" nowrap="nowrap"><span>{item.title}</span></td> : null }
                                        {this.state.windowHeight < 900 ? <td className="listTableGeneralDiv" nowrap="nowrap">{item.title}</td> : null }
                                        {this.state.windowHeight >= 900 ? <td className="listTableGeneralDiv" nowrap="nowrap"><Moment format="D. M. YYYY">{item.date}</Moment></td> : null }
                                        {this.state.windowHeight >= 900 ? <td className="listTableGeneralDiv" nowrap="nowrap">{item.author_name} {item.author_surname}</td> : null }
                                        {this.state.windowHeight >= 900 ? <td className="listTableGeneralDiv" nowrap="nowrap">
                                            {item.status == "not_done" ? <label className="fontPoppinsSemiBold15Blue clickable" style={{border: "1px solid #74788D", color: "#74788D", borderRadius: 5, paddingLeft: 5, paddingRight: 5}}>{"Čeká na splnění"}</label> : null }
                                            {item.status == "done" ? <label className="fontPoppinsSemiBold15Blue clickable" style={{border: "1px solid #21d593", color: "#21d593", borderRadius: 5, paddingLeft: 5, paddingRight: 5}}>{"Hotový"}</label> : null }
                                            {item.status == "mistake" ? <label className="fontPoppinsSemiBold15Blue clickable" style={{border: "1px solid #FA50B3", color: "#FA50B3", borderRadius: 5, paddingLeft: 5, paddingRight: 5}}>{"Chyba v zadání"}</label> : null }
                                        </td> : null }
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

export default TasksTile;
