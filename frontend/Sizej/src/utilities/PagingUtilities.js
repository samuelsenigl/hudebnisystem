import React, { useState, useEffect, useMemo } from "react";

export function goToFirstPageUtilities(actualPage) {
    return 0;
}

export function goToPrevPageUtilities(actualPage) {
    if((actualPage-1) < 0){
        return actualPage;
    }
    else {
        return actualPage-1;
    }
}

export function goToNextPageUtilities(actualPage, recordsOnOnePage, totalNumberOfContacts) {
    var fromValue = (actualPage+1)*recordsOnOnePage;
    var toValue = (actualPage+2)*recordsOnOnePage;
    if( (fromValue >= totalNumberOfContacts)  && (toValue > totalNumberOfContacts) ){
        return actualPage;
    }
    else {
        return actualPage+1;
    }
}

export function goToLastPageUtilities(recordsOnOnePage, totalNumberOfContacts) {
    var page = 0;
    while(( (page+1)*recordsOnOnePage) < totalNumberOfContacts){
        page = page+1;
    }
    return page;
}

export function moreRecordsOnPageUtilities(actualValue) {
    if(actualValue == 5){
        saveRecordsOnOnePageValue(25);
        return 25;
    }
    else if(actualValue == 25){
        saveRecordsOnOnePageValue(50);
        return 50;
    }
    else if(actualValue == 50){
        saveRecordsOnOnePageValue(100);
        return 100;
    }
    else if(actualValue == 100){
        saveRecordsOnOnePageValue(250);
        return 250;
    }
    else if(actualValue == 250){
        saveRecordsOnOnePageValue(500);
        return 500;
    }
    else if(actualValue == 500){
        saveRecordsOnOnePageValue(1000);
        return 1000;
    }
    else if(actualValue == 1000){
        saveRecordsOnOnePageValue(1000);
        return 1000;
    }
    saveRecordsOnOnePageValue(25);
    return 25;
}

export function lessRecordsOnPageUtilities(actualValue) {
    if(actualValue == 1000){
        saveRecordsOnOnePageValue(500);
        return 500;
    }
    else if(actualValue == 500){
        saveRecordsOnOnePageValue(250);
        return 250;
    }
    else if(actualValue == 250){
        saveRecordsOnOnePageValue(100);
        return 100;
    }
    else if(actualValue == 100){
        saveRecordsOnOnePageValue(50);
        return 50;
    }
    else if(actualValue == 50){
        saveRecordsOnOnePageValue(25);
        return 25;
    }
    else if(actualValue == 25){
        saveRecordsOnOnePageValue(5);
        return 5;
    }
    else if(actualValue == 5){
        saveRecordsOnOnePageValue(5);
        return 5;
    }
    saveRecordsOnOnePageValue(25);
    return 25;
}

function saveRecordsOnOnePageValue(value){
    localStorage.setItem("recordsOnOnePage", value);
}