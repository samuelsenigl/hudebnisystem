import React, { useState, useEffect } from "react";
import '../styles/other.css';
import '../styles/components.css';

class GrayTextButton extends React.Component {

    constructor(props) {
        super(props);
    }

    render(){
        return(
            <span className="grayTextButton fontPoppinsRegular13Gray clickable" style={this.props.style} onClick={this.props.onClick}>
                {this.props.title}
            </span>
        );
	}
}

export default GrayTextButton;