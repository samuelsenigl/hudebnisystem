import React, { useState, useEffect } from "react";
import '../styles/other.css';
import '../styles/components.css';

class SearchBox extends React.Component {

    constructor(props) {
        super(props);
    }

    handleTextChange(event) {
        this.setSearchText(event.target.value);
    }

    render(){
        return(
            <div className="topMenuSearchBox horizontalStackCenter">
                <input type="text" className="topMenuSearchBoxInput fontPoppinsRegular13" placeholder="Vyhledat..." value={this.props.searchText} onChange={(event) => this.props.setSearchText(event.target.value)} />
            </div>
        );
	}
}

export default SearchBox;