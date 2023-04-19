import React, { useState, useEffect } from "react";
import '../styles/other.css';
import '../styles/pages.css';
import Axios from 'axios';
import CsvDownloadButton from 'react-json-to-csv';

// import utilities
import { moreRecordsOnPageUtilities, lessRecordsOnPageUtilities, goToPrevPageUtilities, goToNextPageUtilities, goToFirstPageUtilities, goToLastPageUtilities } from '../utilities/PagingUtilities.js';
import { checkForErrorsInRequest } from '../utilities/RequestsUtilities.js';

// import components
import SongsTile from '../tiles/SongsTile.js';
import SearchTileSongs from '../tiles/SearchTileSongs.js';

class Songs extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            songsArray: ([]),
            /*songsArray: ([{id: 1, title:"10 000 důvodů", author: "Matt Redman", capo: "0", tempo: "120 bpm", song_key: "C", tagy: "#pomala #rychla", address: "Brno, Czech Republic", action: "select/add"},
                            {id: 2, nazev:"10 000 Reasons", autor: "Matt Redman", capo: "6", tempo: "90 bpm", tonina: "D", tagy: "#pomala #rychla", address: "Brno, Czech Republic", action: "select/add"},
                            {id: 3, nazev:"Above All", autor: "Matt Redman", capo: "4", tempo: "100 bpm", tonina: "C", tagy: "#pomala #rychla", address: "Brno, Czech Republic", action: "select/add"},
                            {id: 4, nazev:"Amazing Grace", autor: "Matt Redman", capo: "0", tempo: "90 bpm", tonina: "G", tagy: "#pomala #rychla", address: "Brno, Czech Republic", action: "select/add"},
                            {id: 5, nazev:"Áronovo požehnání", autor: "Matt Redman", capo: "0", tempo: "120 bpm", tonina: "G", tagy: "#pomala #rychla", address: "Brno, Czech Republic", action: "select/add"},
                            {id: 6, nazev:"Blíže", autor: "Matt Redman", capo: "1", tempo: "90 bpm", tonina: "E", tagy: "#pomala #rychla", address: "Brno, Czech Republic", action: "select/add"},
                            {id: 7, nazev:"Bůh náš neotřesitelný", autor: "Matt Redman", capo: "0", tempo: "120 bpm", tonina: "G", tagy: "#pomala #rychla", address: "Brno, Czech Republic", action: "select/add"},
                            {id: 8, nazev:"Closer", autor: "Matt Redman", capo: "2", tempo: "120 bpm", tonina: "A", tagy: "#pomala #rychla", address: "Brno, Czech Republic", action: "select/add"},
                            {id: 9, nazev:"Dávám ti srdce své", autor: "Matt Redman", capo: "6", tempo: "90 bpm", tonina: "G", tagy: "#pomala #rychla", address: "Brno, Czech Republic", action: "select/add"},
                            {id: 14, nazev:"Dávám ti srdce své", autor: "Matt Redman", capo: "0", tempo: "70 bpm", tonina: "G", tagy: "#pomala #rychla", address: "Brno, Czech Republic", action: "select/add"}]),*/
            recordsOnOnePage: localStorage.getItem("recordsOnOnePage") || 25, // number of songs showing on one page, 25 would be default, 5 is for testing
            totalNumberOfContacts: 100,
            actualPage: 0, // starts with pageNumber=0, then 1, 2, 3,...
            windowHeight: 1000,
            useAdvancedSearch: false,
            searchAdvancedSongs: ({searchingOption: "and", title: "", author: "", songKey: "", capo: "", tags: "", tempo: ""}),
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
        /*Axios.get('/api/cont/get?tp=1&limit='+this.state.recordsOnOnePage+'&offset='+(this.state.actualPage*this.state.recordsOnOnePage)+'&search='+this.props.searchText).then(response => {
            if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
            this.setState({ songsArray: response.data.result })
        });*/

        if(!this.state.useAdvancedSearch){
            var url = "/api/songs/get?limit="+this.state.recordsOnOnePage+"&offset="+(this.state.actualPage*this.state.recordsOnOnePage);
            if(this.props.searchText != undefined && this.props.searchText != ""){
                url = "/api/songs/get?search="+this.props.searchText+"&limit="+this.state.recordsOnOnePage+"&offset="+(this.state.actualPage*this.state.recordsOnOnePage);
            }

            Axios.get(url).then(response => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                this.setState({ songsArray: response.data.result });
                this.setState({ totalNumberOfContacts: response.data.count });
            });
        }
        else {
            Axios.post("/api/songs/get_adv?limit="+this.state.recordsOnOnePage+"&offset="+(this.state.actualPage*this.state.recordsOnOnePage), {
                searchOption: this.state.searchAdvancedSongs.searchingOption,
                title: this.state.searchAdvancedSongs.title,
                author: this.state.searchAdvancedSongs.author,
                songKey: this.state.searchAdvancedSongs.songKey,
                capo: this.state.searchAdvancedSongs.capo,
                tags: this.state.searchAdvancedSongs.tags,
                tempo: this.state.searchAdvancedSongs.tempo,
            }).then((response) => {
                if(checkForErrorsInRequest(response.data.msg) == 1){ return; }
                this.setState({ songsArray: response.data.result });
                this.setState({ totalNumberOfContacts: response.data.count });
                //alert("Nalezeno "+response.data.count+" výsledků.");
            });
        }

    }

    setSearchAdvancedSongs = async (objectAdvancedSearch) => {
        await this.setState({ searchAdvancedSongs: objectAdvancedSearch });
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
                <SearchTileSongs searchText={this.props.searchText} setSearchText={this.props.setSearchText} searchAdvancedSongs={this.state.searchAdvancedSongs} setSearchAdvancedSongs={this.setSearchAdvancedSongs} />
                <div className="horizontalStackCenter tableListingBar">
                    <span onClick={this.goToFirstPage} className="fontPoppinsSemiBold16 clickable onHoverToOrange">{"<<"}</span>
                    <span onClick={this.goToPrevPage} className="fontPoppinsSemiBold16 clickable onHoverToOrange" style={{paddingLeft: "20px"}}>{"<"}</span>
                    {this.state.windowHeight >= 900 ? <span className="fontPoppinsRegular13Gray" style={{paddingLeft: "20px"}}>{"Seznam písní"}</span> : null }
                    <span className="fontPoppinsSemiBold16" style={{paddingLeft: "12px"}}>{(this.state.actualPage*this.state.recordsOnOnePage)+1}{"-"}{(this.state.actualPage+1)*this.state.recordsOnOnePage > this.state.totalNumberOfContacts ? this.state.totalNumberOfContacts : (this.state.actualPage+1)*this.state.recordsOnOnePage }</span>
                    <span className="fontPoppinsRegular13Gray" style={{paddingLeft: "6px", paddingRight: "6px"}}>{"of"}</span>
                    <span className="fontPoppinsSemiBold16">{this.state.totalNumberOfContacts}</span>
                    <span onClick={this.goToNextPage} className="fontPoppinsSemiBold16 clickable onHoverToOrange" style={{paddingLeft: "20px", paddingRight: "20px"}}>{">"}</span>
                    <span onClick={this.goToLastPage} className="fontPoppinsSemiBold16 clickable onHoverToOrange">{">>"}</span>
                    <div className="flex"/>
                    {this.state.windowHeight >= 900 ? <CsvDownloadButton data={this.state.songsArray} filename={"export_songs.csv"} className="fontPoppinsRegular13Gray clickable onHoverToOrange" style={{backgroundColor: "transparent", border: "none", paddingRight: "30px"}}>Export CSV</CsvDownloadButton> : null}
                    <span className="fontPoppinsRegular13Gray">{"Počet písní:"}</span>
                    <span className="fontPoppinsSemiBold16" style={{paddingLeft: "10px", paddingRight: "10px"}}>{this.state.recordsOnOnePage}</span>
                    <div className="verticalStackCenter">
                        <div onClick={this.moreRecordsOnPage} className="clickable buttonPagingUp"></div>
                        <div style={{height: "3px"}}></div>
                        <div onClick={this.lessRecordsOnPage} className="clickable buttonPagingDown"></div>
                    </div>
                </div>
                <SongsTile songsArray={this.state.songsArray} />
            </div>
        );
    }
}

export default Songs;
