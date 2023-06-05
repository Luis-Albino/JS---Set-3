////////////////////////
////// Stack API ///////
////////////////////////

function Stack (state) {
    this.index = 0;
    this.states = [state];
};

Stack.prototype = {
    appendState: function (newState) {
        this.index++;
        let index = this.index;
        if (index < this.states.length) {
            this.states.splice(index);
        }
        this.states[index] = newState;
        return newState
    },
    get currentState() {
        return this.states[this.index]
    },
    get nextState() {
        if (this.index != this.states.length-1) {
            this.index++;
        }
        return this.states[this.index]
    },
    get previousState() {
        if (this.index !=0) {
            this.index--;
        }
        return this.states[this.index]
    }
};


//////////////////////////////
//////// Repositorium ////////
//////////////////////////////

var repositorium = (function () {

    const repoName = "notes_repositorium";
    // localStorage.clear();

    if (!localStorage.getItem(repoName)) {
        localStorage.setItem(repoName,JSON.stringify({}));
    };

    let repo = JSON.parse(localStorage.getItem(repoName));
    let proto = {};
    // Defining "storeAtRepo" Public Method
    proto.storeAtRepo = function (obj) {
        localStorage.setItem(repoName,JSON.stringify(obj));
    }

    Object.setPrototypeOf(repo,proto);

    return repo
    
})();

//////////////////////////////
/// New Repo Functionality ///
//////////////////////////////

(function () {
    const repoListName = "list_repositorium";

    // Add Ordered List //
    repositorium["list"] = (function (repo) {
        let list;
        if (!localStorage.getItem(repoListName)) {
            list = [];
            for (let note in repo) {
                if (repo.hasOwnProperty(note)) {
                    list.push(note);
                }
            };
            localStorage.setItem(repoListName,JSON.stringify({"list":list}));
        }
        else {
            list = JSON.parse(localStorage.getItem(repoListName))["list"];
        };

        return list

    })(repositorium);

    // Copy Repo method //
    function copyRepo (repo) {
        let newRepo = {};
        for (let el in repo) {
            if (repo.hasOwnProperty(el)) {
                newRepo[el] = repo[el]
            }
        }
        return newRepo
    };

    // Copy List array method //
    function copyList (list) {
        let newList = [];
        for (let i=0; i<list.length; i++) {
            newList.push(list[i])
        }
        return newList
    };

    // list Stack //
    let listStack = new Stack([copyRepo(repositorium),copyList(repositorium["list"])]);

    // repoStack methods //
    function appendToListStack (arr) {
        listStack.appendState(arr);
    };
    Object.getPrototypeOf(repositorium).searchRepoState = function (state) {
        let newStack = listStack[state];
        let newRepo = newStack[0];
        for (let el in newRepo) {
            if (!repositorium[el]) {
                repositorium[el] = newRepo[el]
            }
        };
        for (let el in repositorium) {
            if (repositorium.hasOwnProperty(el) && !newRepo[el]) {
                delete repositorium[el]
            }
        };
        repositorium["list"] = newStack[1];
        repositorium.storeAtRepo(repositorium);
        updateList();
        return listStack
    };

    // updateList() at closure //
    function updateList() {
        localStorage.setItem(repoListName,JSON.stringify({"list":repositorium["list"]}));
    };

    // Add functionality: storeAtList() //
    Object.getPrototypeOf(repositorium).storeAtList = function (noteName) {
        let newRepoList = copyList(repositorium["list"]);
        newRepoList.push(noteName);
        appendToListStack([copyRepo(repositorium),newRepoList]);
        repositorium["list"] = newRepoList;
        updateList();
    };

    Object.getPrototypeOf(repositorium).removeFromList = function (noteName) {
        let i = repositorium["list"].indexOf(noteName);
        let newRepoList = copyList(repositorium["list"]);
        newRepoList.splice(i,1);
        appendToListStack([copyRepo(repositorium),newRepoList]);
        repositorium["list"] = newRepoList;
        updateList();
    };

    Object.getPrototypeOf(repositorium).moveListElement = function (elementName,jumps) {
        let newRepoList;
        if (!!jumps) {
            newRepoList = copyList(repositorium["list"]);
            let i = newRepoList.indexOf(elementName);
            let j = i + jumps;
            j = (j < 0)?0:j;
            j = (j > newRepoList.length-1)?newRepoList.length-1:j;

            let increment = (i > j)?(-1):1;
            while (i != j) {
                newRepoList[i] = newRepoList[i + increment];
                i += increment;
            };
            newRepoList[j] = elementName;
        };
        appendToListStack([copyRepo(repositorium),newRepoList]);
        repositorium["list"] = newRepoList;
        updateList();
    };

    // Add functionality: displayList() //
    Object.getPrototypeOf(repositorium).displayList = function (list,node) {
        // Delete current list //
        while (node.children[0]) {
            node.children[0].remove();
        };

        if (list.length > 0) {
            // Display new list //
            for (let note in list) {
                let div = document.createElement("DIV");
                div.className = "saved_note";
                div.innerHTML = list[note];
                // node.appendChild(div);
                let div2 = document.createElement("DIV");
                div2.appendChild(div)
                node.appendChild(div2);
                // add event listeners //
                div.addEventListener("dblclick",function () {  notePage(list[note]) });           
            };
        }
        else {
            let div = document.createElement("DIV");
            div.className = "notification";
            div.innerHTML = "Empty repositorium";
            node.appendChild(div);
        };
    };

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
    let noteListNode = document.getElementById("note_list_container");
    repositorium.displayList(repositorium["list"],noteListNode);
    noteListNode.addEventListener("mousedown",function (event) { drag(event) });

    /* Button Events */
    document.getElementById("new_note").addEventListener("click",function () { notePage() });

    /* undo/redo */
    document.getElementById("undo").addEventListener("click",function () {
        repositorium.searchRepoState("previousState");
        repositorium.displayList(repositorium["list"],noteListNode);
    });
    document.getElementById("redo").addEventListener("click",function () {
        repositorium.searchRepoState("nextState");
        repositorium.displayList(repositorium["list"],noteListNode);
    });

    /* search input event */
    let searchNode =  document.getElementById("search");
    searchNode.addEventListener("input",function () { search() });

    /* prevent default behavior for ctrl+z */
    window.addEventListener("keydown",function (event) {
        preventCtrlZ(event,function () {
            if (searchNode.value) {
                searchNode.value = null;
                search();
            }
            else {
                repositorium.searchRepoState("previousState");
                repositorium.displayList(repositorium["list"],noteListNode);
            }
        });
    });
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

    /* undo/redo */
    let noteState = [];
    noteState[0] = document.getElementById("title").value;
    noteState[1] = document.getElementById("content").value;
    let noteStack = new Stack([noteState[0],noteState[1]]);
    document.getElementById("title").addEventListener("input",function () {
        noteState[0] = document.getElementById("title").value;
        noteStack.appendState([noteState[0],noteState[1]]);
    });
    document.getElementById("content").addEventListener("input",function () {
        noteState[1] = document.getElementById("content").value;
        noteStack.appendState([noteState[0],noteState[1]]);
    });
    document.getElementById("undoNote").addEventListener("click",function () {
        searchNoteState(noteStack.previousState);
    });
    document.getElementById("redoNote").addEventListener("click",function () {
        searchNoteState(noteStack.nextState);
    });

    /* prevent default behavior for ctrl+z */
    window.addEventListener("keydown",function (event) {
        preventCtrlZ(event,function () { noteStack.previousState });
        // Update info //
        document.getElementById("title").value = noteStack.currentState[0];
        document.getElementById("content").value = noteStack.currentState[1];
    });

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
                repositorium.storeAtRepo(repositorium);
                // Store at repo list just for new notes //
                if (!noteName) {
                    repositorium.storeAtList(noteTitle);
                }
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
    repositorium.removeFromList(noteName);
    homePage();
};

function search () {
    let noteListNode = document.getElementById("note_list_container");
    let value = document.getElementById("search").value;
    if (!!value) {
        let filteredList = [];
        let regex = new RegExp(value,"gi");
        for (let i = 0; i < repositorium["list"].length; i++) {
            if (repositorium["list"][i].match(regex)) {
                filteredList.push(repositorium["list"][i]);
            }
        };
        if (filteredList.length > 0) {
            repositorium.displayList(filteredList,noteListNode);
        }
        else {
            repositorium.displayList(["No matches"],noteListNode);
        }
    }
    else {
        // Display full note list //
        repositorium.displayList(repositorium["list"],noteListNode);
    }
};

function drag (e) {
    let node = e.target;
    let nodeHeight = node.offsetHeight;
    let initialY = e.clientY;
    let displacement;
    let initialOffSetTop = node.offsetTop;
    let parent = node.parentNode;
    let grandFather = parent.parentNode;
    let lastChildDept = grandFather.lastChild.offsetTop;

    node.onmousemove = function (event) {
        parent.style.height = nodeHeight + "px";
        displacement = event.clientY - initialY;
        let finalOffSetTop = node.offsetTop;
        if ((finalOffSetTop >= grandFather.children[0].offsetTop) && (finalOffSetTop <= lastChildDept)) {
            node.style.position = "absolute";
            node.style.top = initialOffSetTop + displacement + "px";
        }
        node.onmouseup = function () {
            node.onmousemove = null;
            node.onmouseleave = null;
            let jump = (displacement > 0)?Math.ceil(displacement/nodeHeight):Math.floor(displacement/nodeHeight);
            repositorium.moveListElement(node.innerHTML,jump);
            repositorium.displayList(repositorium["list"],grandFather);
        }

        node.onmouseleave = function () {
            node.onmousemove = null;
            node.onmouseup = null;
            repositorium.displayList(repositorium["list"],grandFather);
        }
}
};


function preventCtrlZ (event,handler) {
    if (event.key == "Control") {
        event.preventDefault();
        window.onkeydown = function (e) {
            if (e.key == "z") {
                // e.preventDefault();
                handler();
            }
        };
        window.onkeyup = function (e) {
            if (e.key == "Control") {
                // Restore default behavior for keydown event
                window.onkeydown = null
            }
        }
    }
};


function searchNoteState (state) {
    let newState = state;
    document.getElementById("title").value = newState[0];
    document.getElementById("content").value = newState[1];
};

////////////////////////
////// Span Alert //////
////////////////////////

function spanAlert (message,color) {
    let spanAlert = document.getElementById("spanAlert");
    spanAlert.style.color = color;
    spanAlert.innerHTML = message;
};
