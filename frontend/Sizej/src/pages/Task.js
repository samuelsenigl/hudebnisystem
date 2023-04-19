import React, { useState, useEffect } from "react";
import '../styles/tiles.css';
import '../styles/other.css';
import { Link, Navigate } from "react-router-dom";
import Axios from 'axios';
import Moment from 'react-moment';

// import utilities
import { checkForErrorsInRequest } from '../utilities/RequestsUtilities.js';

// import components
import RoundButton from '../components/RoundButton.js';

// assets
import icon_edit from '../assets/icon_edit.png';
import icon_delete from '../assets/icon_delete.png';
import icon_copy from '../assets/icon_copy.png';

class Task extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            redirectTo: null,
            taskId: 0,
            taskObject: {"id_task":0,"title":"Title","content":"Content","date":"2023-01-01T00:00:00.000Z","status":"not_done","created_by":"0"},
            taskShared: ([{"id_musician":0,"name":"name","surname":"surname"}]),
            windowHeight: 1000,
        }
    }

    async componentDidMount(){
        this.loadData();

        this.setState({ redirectTo: null });
        window.addEventListener('resize', this.checkWindowWidth);

        this.checkWindowWidth();
        await new Promise(resolve => setTimeout(resolve, 50));
        this.checkWindowWidth();
    }

    componentWillUnmount() { window.removeEventListener('resize', this.checkWindowWidth); }
    checkWindowWidth = () => { this.setState({ windowHeight: window.innerWidth }); }

    loadData = async () => {
        const { id } = Object.fromEntries(new URLSearchParams(window.location.search));
        if(id != undefined && Number.isInteger(Number(id))){
        //const pathname = window.location.href;
        //var task_id = pathname.substring(pathname.lastIndexOf("/")+1);
        //if(task_id.includes("?")){ task_id = task_id.substring(0, task_id.indexOf("?")); }

        //if(Number.isInteger(Number(task_id))){
            this.setState({ taskId: Number(id) });

            Axios.get('/api/tasks/get/'+id).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                if(response.data.count == 0){alert("Chyba!");return;}
                this.setState({ taskObject: response.data.result[0] });
            });

            Axios.get('/api/tasks/shared/'+id).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                //alert(JSON.stringify(response.data));
                this.setState({ taskShared: response.data.result })
            });
        }
    }

    deleteTask = () => {
        if (window.confirm("Opravdu chcete smazat tento úkol?") == true) {
            Axios.get('/api/tasks/del/'+this.state.taskId).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                this.setState({ redirectTo: "/Tasks" });
            });
        }
    }

    render() {
        if (this.state.redirectTo) {
            return <Navigate to={this.state.redirectTo} />
        }

        return(
                <div className="verticalStack flex" style={{height: "calc(100vh - 80px)", overflowY: "scroll"}}>

                    <div className="verticalStack">

                        <div className="universalTile">
                            <div className="horizontalStack">
                                <div className="verticalStack flex">
                                    <span className="fontPoppinsSemiBold15">{"Úkol: "}<span className="fontPoppinsSemiBold15Blue">{this.state.taskObject.title}</span></span>
                                    <div style={{height: 10}}></div>
                                    <span className="fontPoppinsRegular13DarkGray">{"Datum: "}<span className="fontPoppinsRegular13Gray"><Moment format="D. M. YYYY">{this.state.taskObject.date}</Moment></span></span>
                                    <div style={{height: 10}}></div>
                                    <span className="fontPoppinsRegular13DarkGray">{"Popis úkolu: "}</span>
                                    <span className="fontPoppinsRegular13Gray">{this.state.taskObject.content}</span>
                                </div>
                            </div>
                        </div>

                        <div className="universalTile">
                            <span className="fontPoppinsSemiBold15">{"Stav úkolu"}</span>

                            <div className={this.state.windowHeight >= 900 ? "horizontalStack flex" : "verticalStack flex"} style={{marginTop: 10}} onChange={event => this.setState({ isPrimary: event.target.value })}>
                                <div className="horizontalStackCenter">
                                    <input type="radio" id="current" name="role_primary" value={"1"} checked={this.state.taskObject.status == "not_done" ? true : false}/>
                                    <label for="current" className="fontPoppinsRegular13">Čeká na splnění</label>
                                </div>
                                <div style={{width: 30}}></div>
                                <div className="horizontalStackCenter">
                                    <input type="radio" id="past" name="role_primary" value={"0"} checked={this.state.taskObject.status == "done" ? true : false}/>
                                    <label for="past" className="fontPoppinsRegular13">Hotový</label>
                                </div>
                                <div style={{width: 30}}></div>
                                <div className="horizontalStackCenter">
                                    <input type="radio" id="past" name="role_primary" value={"0"} checked={this.state.taskObject.status == "mistake" ? true : false}/>
                                    <label for="past" className="fontPoppinsRegular13">Chyba v zadání úkolu</label>
                                </div>
                            </div>
                        </div>

                        <div className="universalTile">
                            <div className={this.state.windowHeight >= 900 ? "horizontalStack" : "verticalStack"}>
                                <div className="horizontalStack">
                                    <span className="fontPoppinsSemiBold15">{"Vytvořil"}</span>
                                    <div style={{marginLeft: 10, marginRight: 10}}>
                                        <label className="fontPoppinsSemiBold15Blue clickable" style={{border: "1px solid #556EE6", color: "#556EE6", borderRadius: 5, paddingLeft: 5, paddingRight: 5}}>{this.state.taskObject.author_name} {this.state.taskObject.author_surname}</label>
                                    </div>
                                </div>
                                {this.state.taskShared.length > 0 ? <span className="fontPoppinsSemiBold15">{"a je sdílen s"}</span> : null }

                                <div className={this.state.windowHeight >= 900 ? "horizontalStack" : "verticalStack"}>
                                {this.state.taskShared.length > 0 && this.state.taskShared.map(function (item, index) {
                                    return (
                                        <div className="horizontalStack">
                                            {index != 0 ? <span className="fontPoppinsSemiBold15">{"a"}</span> : null}
                                            <div style={{marginLeft: 10, marginRight: 10}}>
                                                <label className="fontPoppinsSemiBold15Blue clickable" style={{border: "1px solid #556EE6", color: "#556EE6", borderRadius: 5, paddingLeft: 5, paddingRight: 5}}>{item.name} {item.surname}</label>
                                            </div>
                                        </div>
                                    )
                                }.bind(this))}
                                </div>
                            </div>
                        </div>

                        <div className="universalTile">
                            <div className={this.state.windowHeight >= 900 ? "horizontalStack" : "verticalStack"}>
                                <div className="horizontalStack">
                                    <RoundButton title={"Upravit"} icon={icon_edit} onClick={() => this.setState({ redirectTo: "/NewTask?update="+this.state.taskId })} />
                                </div>
                                <div style={{width: 10,height: 10}}></div>
                                <div className="horizontalStack">
                                    <RoundButton title={"Duplikovat"} icon={icon_copy} onClick={() => this.setState({ redirectTo: "/NewTask?duplicate="+this.state.taskId })} />
                                </div>
                                <div style={{width: 10,height: 10}}></div>
                                <div className="horizontalStack">
                                    <RoundButton title={"Smazat"} icon={icon_delete} onClick={() => this.deleteTask()} />
                                </div>
                            </div>
                        </div>
                        
                        <div style={{height: 20}}></div>
                    </div>
                </div>
        );
    }
}

export default Task;