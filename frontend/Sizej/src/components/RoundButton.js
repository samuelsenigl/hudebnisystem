import React, { useState, useEffect } from "react";
import '../styles/other.css';
import '../styles/components.css';

class RoundButton extends React.Component {

    constructor(props) {
        super(props);
    }

    render(){
        return(
            <div class="roundButton horizontalStackCenter clickable" style={this.props.style} onClick={this.props.onClick}>
                <img style={{height: "18px"}} src={this.props.icon}/>
                <span className="fontPoppinsRegular13" style={{marginLeft: this.props.icon != null ? "10px" : "4px", color: this.props.whiteText ? "white" : "black"}}>{this.props.title}</span>
            </div>
        );
	}
}

export default RoundButton;