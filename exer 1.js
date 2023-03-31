//////////////////////////////
//////// Repositorium ////////
//////////////////////////////

// localStorage.clear();

const repoName = "notes_repositorium";

function createRepo (repoPath) {
    let emptyObj = {}; // empty object
    localStorage.setItem(repoPath,JSON.stringify(emptyObj));
};

function loadRepo(repoPath) {
    if (!!localStorage.getItem(repoPath)) {
        return JSON.parse(localStorage.getItem(repoPath))
    }
    else {
        createRepo(repoPath);
        return loadRepo(repoPath);
    }
};

let  repositorium = loadRepo(repoName);


//////////////////////////////
/// Repo utility functions ///
//////////////////////////////

function store (obj) {
    localStorage.setItem(repoName,JSON.stringify(obj));
}

function saveAtRepo (noteName,info) {
    let newNote = {};
    let date = new Date();
    newNote["lastModified"] = 
        ((date.getMonth() < 10)?"0":"") + date.getMonth() + "/" 
        + date.getDate() + "/" 
        + date.getFullYear() + ", " 
        + ((date.getHours() < 10)?"0":"") + date.getHours() + ":" 
        + date.getMinutes() + " hrs";
    if (!repositorium[noteName]) {
        // Assigns a creation date only to newly created notes
        newNote["creationDate"] = newNote["lastModified"];
    }
    else {
        // Uses the existing creation date
        newNote["creationDate"] = repositorium[noteName]["creationDate"];
    };
    newNote["info"] = info;
    repositorium[noteName] = newNote;
    store(repositorium);
}

function deleteFromRepo (noteName) {
    delete repositorium[noteName];
    store(repositorium);
};

//////////////////////////////
/// Note utility functions ///
//////////////////////////////

function saveNote () {
    let noteTitle = window.document.getElementById("title").value;
    let noteContent = window.document.getElementById("content").value;
    saveAtRepo(noteTitle,noteContent);
}

function myNoteList () {
    let container = document.createElement("DIV");
    container.className = "note_list";
    document.body.appendChild(container);
    
    let noteListHeader = document.createElement("DIV");
    noteListHeader.innerHTML = "My notes";
    noteListHeader.style.fontSize = "22px";
    noteListHeader.style.border = "2px solid black";
    noteListHeader.style.background = "rgb(54, 225, 168)"
    container.appendChild(noteListHeader);
    
    for (let note in repositorium) {
        let div = document.createElement("DIV");
        div.className = "saved_note";
        div.innerHTML = note;
        container.appendChild(div);
        // add event listeners //
        div.addEventListener("click",function () { open(note) });
    }
    
    document.body.appendChild(document.createElement("BR"));
}

//////////////////////////////
////// fictitious notes //////
//////////////////////////////

// localStorage.clear();

// saveAtRepo("Note 1","info 1");
// saveAtRepo("Note 2","info 2");
// saveAtRepo("Note 3","info 3");

// deleteFromRepo("Note 2");

//////////////////////////////
///////// Home Page //////////
//////////////////////////////

function homePage () {
    if (Object.keys(repositorium).length > 0) {
        myNoteList();
    };
    
    let btn = document.createElement("BUTTON");
    btn.innerHTML = "New note";
    btn.className = "btn";
    btn.addEventListener("click",function () { open(null) });
    document.body.appendChild(btn);
}

//////////////////////////////
/////// New Note Page ////////
//////////////////////////////

function noteCreator (noteName) {
    let form = document.createElement("FORM");

    // Note title //
    let divTitle = document.createElement("DIV");
    let labelTitle = document.createElement("LABEL");
    labelTitle.innerHTML = "Title: ";
    labelTitle.setAttribute("for","title");
    let inputTitle = document.createElement("INPUT");
    inputTitle.setAttribute("type","text");
    inputTitle.setAttribute("placeholder","Type title");
    inputTitle.setAttribute("name","title");
    inputTitle.id = "title";
    let spanAlert  = document.createElement("SPAN"); // Ausxiliar for alerts
    spanAlert.id = "spanAlert";
    divTitle.appendChild(labelTitle);
    divTitle.appendChild(inputTitle);
    divTitle.appendChild(spanAlert);
    form.appendChild(divTitle);
    form.appendChild(document.createElement("BR"));
    
    // Note content //
    let labelContent = document.createElement("LABEL");
    labelContent.innerHTML = "Content: ";
    labelContent.setAttribute("for","content");
    let inputContent = document.createElement("TEXTAREA");
    inputContent.setAttribute("type","text");
    inputContent.setAttribute("placeholder","Type content");
    inputContent.setAttribute("name","content");
    inputContent.id = "content";
    form.appendChild(labelContent);
    form.appendChild(document.createElement("BR"));
    form.appendChild(inputContent);

    // Creation date //
    let creationDate = document.createElement("SPAN");
    creationDate.id = "creationcreationDate";
    creationDate.innerHTML = !!repositorium[noteName]?"Creation date: " + repositorium[noteName]["creationDate"]:"";
    form.appendChild(creationDate);
    form.appendChild(document.createElement("BR"));
    
    // Last modified //
    let lastModified = document.createElement("SPAN");
    lastModified.id = "lastModified";
    lastModified.innerHTML = (!!repositorium[noteName])?"Last modified: " + repositorium[noteName]["lastModified"]:"";
    form.appendChild(lastModified);
    form.appendChild(document.createElement("BR"));
    form.appendChild(document.createElement("BR"));
    
    // Append to document.body //
    document.body.appendChild(form);

    // add event listener //
    inputTitle.addEventListener("click",
        function () {
            spanAlert.innerHTML = "";
        }
    );

    // Fill note information //
    if (repositorium[noteName]) {
        inputTitle.value = noteName;
        inputContent.value = repositorium[noteName]["info"];
    };
}

////////////////////////
//// function OPEN /////
////////////////////////

function open (note) {
    let win = window.open("./exer%201.html", note, "");
}


////////////////////////
// Template rendering //
////////////////////////


if (!window.opener) {
    homePage();
}
else {
    noteCreator(window.name);

    goBackButton(window.opener);
    saveButton();     
    deleteButton(window.name,window.opener);
};

////////////////////////
//////// ANCHOR ////////
////////////////////////

function backAnchor (button,innerHtml) {
    let anchor = window.document.createElement("A");
    anchor.setAttribute("href","./exer%201.html");
    anchor.innerHTML = innerHtml;
    anchor.style.textDecoration = "none";
    anchor.style.color = "black";

    button.appendChild(anchor);
};

////////////////////////
////// Span Alert //////
////////////////////////

function spanAlert (message,color) {
    let spanAlert = window.document.getElementById("spanAlert");
    spanAlert.style.color = color;
    spanAlert.innerHTML = message;
}

////////////////////////
//////// BUTTONS ////////
////////////////////////

function goBackButton (windowOpener) {
    let btn = window.document.createElement("BUTTON");
    btn.className = "btn";
    btn.setAttribute("type","button");
    btn.addEventListener("click",function () {windowOpener.close()});

    backAnchor(btn,"<< go back");
    document.body.appendChild(btn);
};

function saveButton () {
    let btnSave = window.document.createElement("BUTTON");
    btnSave.setAttribute("type","button");
    btnSave.style.cursor = "pointer";
    btnSave.innerHTML = "Save";
    btnSave.addEventListener("click",
        function () {
            let noteTitle = window.document.getElementById("title");
            // Checks title validity //
            if (!!(noteTitle.value)) {
                let availableTitle = true;
                // Checks title availability (for new notes) //
                for (let note in repositorium) {
                    if (note != window.name && note === noteTitle.value) {
                        availableTitle = false;
                    }
                };
                // Saves note //
                if (availableTitle) {
                    saveNote();
                    spanAlert(" Saved","blue");
                    let creationDate = window.document.getElementById("creationcreationDate");
                    let lastModified = window.document.getElementById("lastModified");
                    let noteTitle = window.document.getElementById("title").value;
                    creationDate.innerHTML = "Creation date: " + repositorium[noteTitle]["creationDate"];
                    lastModified.innerHTML = "Last modified: " + repositorium[noteTitle]["lastModified"];
                    setTimeout(function () {spanAlert("","blue")},2000);
                }
                else {
                    spanAlert(" This title has already been asigned to another noteBook","red");
                };
            }
            else {
                spanAlert(" Title required","red");
            };
        }
    );

    document.body.appendChild(btnSave);
};

function deleteButton (noteName,windowOpener) {
    let btnDelete = window.document.createElement("BUTTON");
    btnDelete.setAttribute("type","button");
    btnDelete.style.cursor = "pointer";
    btnDelete.addEventListener("click",
        function () {
            windowOpener.close();
            deleteFromRepo(noteName);
        }
    );

    backAnchor(btnDelete,"Delete");
    document.body.appendChild(btnDelete); 
};