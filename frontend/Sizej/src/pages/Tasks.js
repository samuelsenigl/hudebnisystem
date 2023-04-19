import React, { useState, useEffect } from "react";
import '../styles/other.css';
import '../styles/pages.css';
import Axios from 'axios';
import CsvDownloadButton from 'react-json-to-csv';

// import utilities
import { moreRecordsOnPageUtilities, lessRecordsOnPageUtilities, goToPrevPageUtilities, goToNextPageUtilities, goToFirstPageUtilities, goToLastPageUtilities } from '../utilities/PagingUtilities.js';
import { checkForErrorsInRequest } from '../utilities/RequestsUtilities.js';

// import components
import TasksTile from '../tiles/TasksTile.js';
import SearchTileTasks from '../tiles/SearchTileTasks.js';

class Tasks extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            tasksArray: ([]),
            /*tasksArray: ([{id: 3, nadpis:"Naučit se bridge k Jsi cesta", datum: "20.8.2022", sdilen: "Samuel Šenigl, Markéta Šeniglová", stav: "čeká na splnění", tonina: "C", tagy: "#pomala #rychla", address: "Brno, Czech Republic", action: "select/add"},
                            {id: 3, nadpis:"Cvičit vyhrávku k 10 000 Reasons", datum: "1.9.2022", sdilen: "Samuel Šenigl", stav: "hotový", tonina: "D", tagy: "#pomala #rychla", address: "Brno, Czech Republic", action: "select/add"},
                            {id: 3, nadpis:"Above All", datum: "5.9.2022", sdilen: "Grace Rector", stav: "hotový", tonina: "C", tagy: "#pomala #rychla", address: "Brno, Czech Republic", action: "select/add"},
                            {id: 3, nadpis:"Above All", datum: "5.9.2022", sdilen: "Grace Rector", stav: "hotový", tonina: "C", tagy: "#pomala #rychla", address: "Brno, Czech Republic", action: "select/add"},
                            {id: 3, nadpis:"Above All", datum: "5.9.2022", sdilen: "Grace Rector", stav: "hotový", tonina: "C", tagy: "#pomala #rychla", address: "Brno, Czech Republic", action: "select/add"}]),*/
            recordsOnOnePage: localStorage.getItem("recordsOnOnePage") || 25, // number of tasks showing on one page, 25 would be default, 5 is for testing
            totalNumberOfContacts: 100,
            actualPage: 0, // starts with pageNumber=0, then 1, 2, 3,...
            windowHeight: 1000,
            useAdvancedSearch: false,
            searchAdvancedTasks: ({searchingOption: "and", taskTitle: "", taskContent: "", createdBy: 0, sharedWith: 0, status: ""}),
        }

    }

    async componentDidMount(){
        await this.setState({ useAdvancedSearch: false });
        this.loadData();

        this.setState({ redirectTo: null });
        window.addEventListener('resize', this.checkWindowWidth);

        this.checkWindowWidth();
        await new Promise(resolve => setTimeout(resolve, 50));
        this.checkWindowWidth();
    }

    componentWillUnmount() { window.removeEventListener('resize', this.checkWindowWidth); }
    checkWindowWidth = () => { this.setState({ windowHeight: window.innerWidth }); }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.searchText !== this.props.searchText) {
            this.setState({ actualPage: 0 });
            this.loadData();
        }
    }

    loadData = () => {
        if(!this.state.useAdvancedSearch){
            var url = "/api/tasks/get?limit="+this.state.recordsOnOnePage+"&offset="+(this.state.actualPage*this.state.recordsOnOnePage);
            if(this.props.searchText != undefined && this.props.searchText != ""){
                url = "/api/tasks/get?search="+this.props.searchText+"&limit="+this.state.recordsOnOnePage+"&offset="+(this.state.actualPage*this.state.recordsOnOnePage);
            }

            Axios.get(url).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                this.setState({ tasksArray: response.data.result });
                this.setState({ totalNumberOfContacts: response.data.count });
            });
        }
        else {
            Axios.post("/api/tasks/get_adv?limit="+this.state.recordsOnOnePage+"&offset="+(this.state.actualPage*this.state.recordsOnOnePage), {
                searchOption: this.state.searchAdvancedTasks.searchingOption,
                title: this.state.searchAdvancedTasks.taskTitle,
                content: this.state.searchAdvancedTasks.taskContent,
                createdBy: this.state.searchAdvancedTasks.createdBy,
                sharedWith: this.state.searchAdvancedTasks.sharedWith,
                status: this.state.searchAdvancedTasks.status,
            }).then((response) => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                this.setState({ tasksArray: response.data.result });
                this.setState({ totalNumberOfContacts: response.data.count });
                //alert("Nalezeno "+response.data.count+" výsledků.");
            });
        }
    }

    setSearchAdvancedTasks = async (objectAdvancedSearch) => {
        await this.setState({ searchAdvancedTasks: objectAdvancedSearch });
        await this.setState({ useAdvancedSearch: true });
        this.loadData();
    }

    goToFirstPage = async () => {
        await this.setState({ actualPage: goToFirstPageUtilities(this.state.actualPage) });
        this.loadData();
    }

    goToPrevPage = async () => {
        await this.setState({ actualPage: goToPrevPageUtilities(this.state.actualPage) });
        this.loadData();
    }

    goToNextPage = async () => {
        await this.setState({ actualPage: goToNextPageUtilities(this.state.actualPage, this.state.recordsOnOnePage, this.state.totalNumberOfContacts) });
        this.loadData();
    }

    goToLastPage = async () => {
        await this.setState({ actualPage: goToLastPageUtilities(this.state.recordsOnOnePage, this.state.totalNumberOfContacts) });
        this.loadData();
    }

    moreRecordsOnPage = async () => {
        await this.setState({ recordsOnOnePage: moreRecordsOnPageUtilities(this.state.recordsOnOnePage) });
        this.loadData();
    }

    lessRecordsOnPage = async () => {
        await this.setState({ recordsOnOnePage: lessRecordsOnPageUtilities(this.state.recordsOnOnePage) });
        this.loadData();
    }

    render() {
        return (
            <div className="verticalStack flex" style={{height: this.state.windowHeight >= 900 ? "calc(100vh - 80px)" : "calc(100vh)"}}>
                <SearchTileTasks searchText={this.props.searchText} setSearchText={this.props.setSearchText} searchAdvancedTasks={this.state.searchAdvancedTasks} setSearchAdvancedTasks={this.setSearchAdvancedTasks} />
                <div className="horizontalStackCenter tableListingBar">
                    <span onClick={this.goToFirstPage} className="fontPoppinsSemiBold16 clickable onHoverToOrange">{"<<"}</span>
                    <span onClick={this.goToPrevPage} className="fontPoppinsSemiBold16 clickable onHoverToOrange" style={{paddingLeft: "20px"}}>{"<"}</span>
                    {this.state.windowHeight >= 900 ? <span className="fontPoppinsRegular13Gray" style={{paddingLeft: "20px"}}>{"Seznam úkolů"}</span> : null }
                    <span className="fontPoppinsSemiBold16" style={{paddingLeft: "12px"}}>{(this.state.actualPage*this.state.recordsOnOnePage)+1}{"-"}{(this.state.actualPage+1)*this.state.recordsOnOnePage > this.state.totalNumberOfContacts ? this.state.totalNumberOfContacts : (this.state.actualPage+1)*this.state.recordsOnOnePage }</span>
                    <span className="fontPoppinsRegular13Gray" style={{paddingLeft: "6px", paddingRight: "6px"}}>{"of"}</span>
                    <span className="fontPoppinsSemiBold16">{this.state.totalNumberOfContacts}</span>
                    <span onClick={this.goToNextPage} className="fontPoppinsSemiBold16 clickable onHoverToOrange" style={{paddingLeft: "20px", paddingRight: "20px"}}>{">"}</span>
                    <span onClick={this.goToLastPage} className="fontPoppinsSemiBold16 clickable onHoverToOrange">{">>"}</span>
                    <div className="flex"/>
                    {this.state.windowHeight >= 900 ? <CsvDownloadButton data={this.state.tasksArray} filename={"export_tasks.csv"} className="fontPoppinsRegular13Gray clickable onHoverToOrange" style={{backgroundColor: "transparent", border: "none", paddingRight: "30px"}}>Export CSV</CsvDownloadButton> : null}
                    <span className="fontPoppinsRegular13Gray">{"Počet úkolů:"}</span>
                    <span className="fontPoppinsSemiBold16" style={{paddingLeft: "10px", paddingRight: "10px"}}>{this.state.recordsOnOnePage}</span>
                    <div className="verticalStackCenter">
                        <div onClick={this.moreRecordsOnPage} className="clickable buttonPagingUp"></div>
                        <div style={{height: "3px"}}></div>
                        <div onClick={this.lessRecordsOnPage} className="clickable buttonPagingDown"></div>
                    </div>
                </div>
                <TasksTile tasksArray={this.state.tasksArray} />
            </div>
        );
    }
}

export default Tasks;
