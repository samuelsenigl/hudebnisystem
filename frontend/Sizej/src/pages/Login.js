import React, { useState, useEffect } from "react";
import { Link, Redirect, useNavigate } from "react-router-dom";
import '../App.css';
import '../styles/pages.css';
import '../styles/other.css';
import Axios from 'axios';
import CookieConsent from "react-cookie-consent";

// import assets
import logo2 from '../assets/logo2.png';

async function loginUser(credentials) {
    console.log(credentials);
    return fetch(Axios.defaults.baseURL+'api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    })
   .then(data => data.json())

    //Using Axios is not working
    //await Axios.get('/api/login2',{credentials}).then(response => alert(response));

    /*return Axios.post('/api/login2', credentials, { withCredentials: true, credentials: 'include' })
        .then(response => alert(response));*/
}

function Login({ setToken }) {
    const [username, setUserName] = useState();
    const [password, setPassword] = useState();
    const [logged, setLogged] = useState(false);
    //const history = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        //console.log(username);
        //console.log(password);
        const response = await loginUser({
          username,
          password
        });

        console.log(response);
        if(response.loginWasSuccessful == 1){
            console.log("SUCCESSFUL LOGIN");
            setToken(response.token);
        }
        else {
            console.log("UNSUCCESSFUL LOGIN");
            alert("Wrong username or password.");
        }
        //console.log(username);
        //console.log(password);

        // logged = true;
        // localStorage.setItem('token', token.token);
        //localStorage.setItem('logged1', true);
        //localStorage.setItem('user_first_name', response.first_name);
        //localStorage.setItem('user_last_name', response.last_name);

        //console.log(logged);

        //alert(response.last_name);
        //window.location.reload(true);
        //window.location.href = "http://foo.com/error.php";
        window.location.href = "/";
    }

    useEffect(() => {
        localStorage.setItem("actualPage", "sign");
    }, []);

    const openPromoPage = () => {
        window.location.href = "/Promo";
    }

    const openRegistrationPage = () => {
        window.location.href = "/Registration";
    }

    const openForgotPasswordPage = () => {
        window.location.href = "/ForgotPassword";
    }

	return(
        <div className="loginPage">
            <div className="verticalStack">

                <center>
                    <div className="verticalStack" style={{alignItems: "center"}}>

                        <img style={{height: "120px", width: "120px"}} src={logo2}/>

                        <span className="loginTitle">{"Sizej Web"}</span>
                    </div>

                    <div className="verticalStack" style={{alignItems: "center", width: "380px"}}>

                        <form onSubmit={handleSubmit} style={{width: "100%"}}>

                            <div className="loginPageEmailElement" style={{marginTop: "50px"}}>
                                <input className="loginPageEmailInput fontPoppinsRegular13" type="text" placeholder="Username" onChange={e => setUserName(e.target.value)} />
                            </div>

                            <div className="horizontalStackCenter loginPagePasswordElement" style={{marginTop: "24px"}}>
                                <input className="loginPagePasswordInput fontPoppinsRegular13" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
                                <button className="loginPageLoginButton clickable" type="submit"><span className="fontPoppinsRegular13">{"Přihlásit se"}</span></button>
                            </div>

                        </form>

                        <div className="horizontalStackCenter" style={{width: "100%", marginTop: "24px"}}>
                            <span className="fontPoppinsRegular13White clickable" style={{paddingLeft: "15px"}} onClick={() => openRegistrationPage()}>Vytvořit nový účet</span>
                            <div className="flex"></div>
                            <span className="fontPoppinsRegular13White clickable" style={{paddingRight: "15px"}} onClick={() => openForgotPasswordPage()}>Zapomenuté heslo</span>
                        </div>

                        <div className="horizontalStackCenter" style={{width: "100%", marginTop: "24px"}}>
                            <span className="loginPageLoginButton clickable fontPoppinsRegular13" style={{width: "100%"}} onClick={() => openPromoPage()}>Informace o webu</span>
                        </div>

                        {/*<div className="horizontalStackCenter" style={{justifyContent: "center", width: "100%", marginTop: "24px"}}>
                            <span className="fontPoppinsRegular13White clickable" style={{paddingLeft: "15px"}}>Další odkaz</span>
                        </div>*/}

                    </div>
                </center>
            </div>

            <CookieConsent
                location="bottom"
                buttonText="Povolit"
                cookieName="cookieConsent"
                style={{ background: "#556EE6" }}
                buttonStyle={{ fontFamily: "PoppinsRegular", color: "black", background: "#d4daf9", fontSize: "13px", borderRadius: 20 }}
                expires={150}>
                    <span className="fontPoppinsRegular13White">Kliknutím na „Povolit“ dáváte souhlas se zpracováním cookies a dalších osobních údajů.</span>{" "}
                    {/*<span style={{ fontSize: "10px" }}>This bit of text is smaller</span>*/}
            </CookieConsent>
        </div>
	);

}
export default Login;