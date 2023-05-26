function findPalindrome (text) {
    try {
        if (typeof text != "string") throw "Invalid iput: String required";
    }
    catch (err) {
        console.log(err);
        return
    }

    let word = text.match(/[a-zA_Z]+/g);
    let list = [];
    let matches = 0;

    for (let i in word) {
        let regex = palindromeRegExp(word[i].length);
        let palindrome = word[i].match(regex);
        if (!!palindrome) {
            list[matches] = palindrome[0];
            matches++;

        }
    };
    console.log(list)
}

/* This function construct a regular expression depending on the palindrome's length */
function palindromeRegExp (palindromeLength) {
    let source = "";
    if (palindromeLength > 1) {
        let j = Math.ceil(palindromeLength/2);
        for (let i=0; i<j; i++) {
            source = "(.)"+ source + "\\" + (j-i) + (((i === 0) && (palindromeLength != 2))?"?":"");
        };
        return new RegExp(source,"gi")
    }
    else {
        return new RegExp(/(.)\1/,"gi")
    };

};


/////////////

findPalindrome("Anna and her mom want to do kayak this noon. They should peep the level of the river first");
