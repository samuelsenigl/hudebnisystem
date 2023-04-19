import React, { useState, useEffect, useMemo } from "react";
import {useNavigate} from 'react-router-dom';

export function checkForErrorsInRequest(message) {

    if(message == "ERR_TOKEN"){
        localStorage.setItem('saved_token', "");
        window.location.reload();
        return 0;
    }
    else if(message == "ERR_TOKEN_MISSING"){
        localStorage.setItem('saved_token', "");
        window.location.reload();
        return 0;
    }
    else if(message == "ERR_TOKEN_INVALID"){
        localStorage.setItem('saved_token', "");
        window.location.reload();
        return 0;
    }
    return 0;
}
