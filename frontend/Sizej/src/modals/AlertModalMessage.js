import React from 'react';
import ReactDOM from 'react-dom';

// components
import AlertModal from '../modals/AlertModal';

class AlertModalMessage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

	render(){
		return(
            <React.Fragment>
                <AlertModal show={this.props.showModal} onClick={() => this.props.closeModal()}>
                    <div className="content">
                        <div className="verticalStack">
                            <span className="fontPoppinsMedium20Orange" style={{textAlign: "center", paddingLeft: 30, paddingRight: 30}}>{this.props.message}</span>
                            <div style={{height: 1, backgroundColor: "#EFF2F7", marginTop: 15, marginBottom: 15, marginLeft: -20, marginRight: -20}}></div>
                            <div className="horizontalStack clickable" style={{height: 60, alignItems: "center", borderRadius: "0px 0px 20px 20px", marginLeft: -20, marginRight: -20, marginBottom: -20, marginTop: -20}} onClick={() => this.props.closeModal()}>
                                <div className="flex"></div>
                                <span className="fontPoppinsMedium20Gray">{this.props.closeButton}</span>
                                <div className="flex"></div>
                            </div>
                        </div>
                    </div>
                </AlertModal>
            </React.Fragment>
		);
	}
}
export default AlertModalMessage;