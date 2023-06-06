//////////////////////////////
//////// Repositorium ////////
////// (MODULE PATTERN) //////
//////////////////////////////

var repositorium;
repositorium = repositorium || (function () {

    const repoName = "notes_repositorium";
    // localStorage.clear();

    if (!localStorage.getItem(repoName)) {
        localStorage.setItem(repoName,JSON.stringify({}));
    };

    let myRepo = JSON.parse(localStorage.getItem(repoName));
    let myProto = {};
    // Defining "storeAtRepo" Public Method
    myProto.storeAtRepo = function (obj) {
        localStorage.setItem(repoName,JSON.stringify(obj));
    }

    Object.setPrototypeOf(myRepo,myProto);

    return myRepo
    
})();


///////////////////////////////
/// Simple Note Constructor ///
///////////////////////////////

function SimpleNote (myNoteName,myInfo) {
    let date = new Date();
    this["lastModified"] = 
        ((date.getMonth() < 10)?"0":"") + date.getMonth() + "/" 
        + date.getDate() + "/" 
        + date.getFullYear() + ", " 
        + ((date.getHours() < 10)?"0":"") + date.getHours() + ":" 
        + ((date.getMinutes() < 10)?"0":"") + date.getMinutes() + " hrs";
    if (!repositorium[myNoteName]) {
        // Assigns a creation date only to newly created notes
        this["creationDate"] = this["lastModified"];
    }
    else {
        // Uses the existing creation date
        this["creationDate"] = repositorium[myNoteName]["creationDate"];
    };
    this["info"] = myInfo;
};

///////////////////////////////
//////// Notes FACTORY ////////
///////////////////////////////

function NoteFactory () {};
NoteFactory.prototype.noteClass = SimpleNote;
NoteFactory.prototype.writeNote = function (noteName,noteContent) {
    return new this.noteClass(noteName,noteContent)
};

var simpleNoteFactory = new NoteFactory();


//////////////////////////////
// Utility: remove template //
//////////////////////////////

function renderTemplate (templateID) {
    // Remove current template //
    let bodyNode = document.body.children[2];
    if (bodyNode) { bodyNode.remove(); };

    // Render new template //
    let newTemplate = document.getElementById(templateID);
    document.body.appendChild(newTemplate.content.cloneNode(true));
};


//////////////////////////////
///////// Home Page //////////
//////////////////////////////

function homePage () {
    renderTemplate("homePageTemplate");

    // Display note list //
    let noteList = document.getElementById("note_list");

    if (Object.keys(repositorium).length > 0) {
        // IIFE: Display Note List //
        (function () {
            for (let note in repositorium) {
                if (repositorium.hasOwnProperty(note)) {
                    let div = document.createElement("DIV");
                    div.className = "saved_note";
                    div.innerHTML = note;
                    noteList.appendChild(div);
                    // add event listeners //
                    div.addEventListener("click",function () { notePage(note) });            
                }
            }
        })();
    }
    else {
        noteList.style.display = "none";
    };

    /* Button Events */
    document.getElementById("new_note").addEventListener("click",function () { notePage() })
};

// Initialize Home Page //
homePage();


//////////////////////////////
////////// Note Page /////////
//////////////////////////////

function notePage (noteName) {
    renderTemplate("notePageTemplate");

    // Fill note information //
    if (repositorium[noteName]) {
        document.getElementById("title").value = noteName;
        document.getElementById("content").value = repositorium[noteName]["info"];
        document.getElementById("creationcreationDate").innerHTML = !!repositorium[noteName]?"Creation date: " + repositorium[noteName]["creationDate"]:"";
        document.getElementById("lastModified").innerHTML = (!!repositorium[noteName])?"Last modified: " + repositorium[noteName]["lastModified"]:"";
    };

    /* Button Events */
    document.getElementById("go_back").addEventListener("click",function () { homePage() });
    document.getElementById("save").addEventListener("click",function () { saveNote(noteName) });
    document.getElementById("delete").addEventListener("click",function () { deleteNote(noteName) });

    /* prevent default behavior for Tab key */
    function changeDefaultTAB (inputTagID) {
        let inputTag = document.getElementById(inputTagID);
        inputTag.addEventListener("keydown",function (event) {
            if (event.key == "Tab") { 
                event.preventDefault();
                inputTag.value = inputTag.value + "        ";
            }
        })
    };

    changeDefaultTAB("title");
    changeDefaultTAB("content");

};


////////////////////////
//// Event handlers ////
////////////////////////

function saveNote (noteName) {
    let titleInput = document.getElementById("title");
    // Checks title validity //
    if (!!(titleInput.value)) {
        let availableTitle = true;
        // Checks title availability (for new notes) //
        if (!noteName) {
            for (let note in repositorium) {
                if (note === titleInput.value) {
                    availableTitle = false;
                }
            };
        };
        // Saves note //
        if (availableTitle) {
            // IIFE: Save Note At Repositorium //
            (function () {
                let noteTitle = document.getElementById("title").value;
                let noteContent = document.getElementById("content").value;
                // Store At Repositorium //
                repositorium[noteTitle] = simpleNoteFactory.writeNote(noteTitle,noteContent);
                repositorium.storeAtRepo(repositorium)
            })();

            let creationDate = document.getElementById("creationcreationDate");
            let lastModified = document.getElementById("lastModified");
            let noteTitle = document.getElementById("title").value;
            creationDate.innerHTML = "Creation date: " + repositorium[noteTitle]["creationDate"];
            lastModified.innerHTML = "Last modified: " + repositorium[noteTitle]["lastModified"];

            if (!noteName) {
                notePage(noteTitle);
            }

            spanAlert(" Saved","blue");
            setTimeout(function () {spanAlert("","blue")},2000);
        }
        else {
            spanAlert(" This title has already been asigned to another noteBook","red");
        };
    }
    else {
        spanAlert(" Title required","red");
    };
};

function deleteNote(noteName) {
    // Delete From Repositorium //
    delete repositorium[noteName];
    repositorium.storeAtRepo(repositorium);
    homePage();
}


////////////////////////
////// Span Alert //////
////////////////////////

function spanAlert (message,color) {
    let spanAlert = document.getElementById("spanAlert");
    spanAlert.style.color = color;
    spanAlert.innerHTML = message;
};
