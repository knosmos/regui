class unit{
    // base class for all block units.
    constructor(parent=document.body,label="unit", color="#2A9D8F", borderColor="#218074"){
        this.label = label;
        this.color = color;
        this.textColor = "white";
        this.borderColor = borderColor;
        this.children = [];
        this.elem = null;
        this.parent = parent;

        // Create html elements
        this.elem = document.createElement("div");
        this.textElem = document.createElement("div");
        this.elem.appendChild(this.textElem);
        this.parent.elem.appendChild(this.elem);

        this.deleted = false;
    }
    add(elem){
        // Add a child element
        this.children.push(elem);
    }
    render(){
        // renders the unit in HTML

        // First, create the element itself
        this.elem.className = "panel";
        this.elem.style.backgroundColor = this.color;
        this.elem.style.border = `4px solid ${this.borderColor}`;
        
        // add the text label
        this.textElem.className = "label";
        this.textElem.innerHTML = this.label;
        this.textElem.style.color = this.textColor;

        // add each of its children
        for (let child of this.children){
            child.render();
        }   
    }
    convert(){
        // converts contents of unit into text
    }
}

class blank_unit extends unit{
    constructor(parent){
        super(parent,"<em>select</em>","rgba(200,200,200,0.4)","rgba(100,100,100,0.5)");
        this.child = null;
        this.elem = null;
        this.parent = parent;
        
        this.elem = document.createElement("div");
        this.selectElem = document.createElement("select");
        this.elem.appendChild(this.selectElem);
        parent.elem.appendChild(this.elem);

        this.mapping = {
            "grouping":{
                "charset"   : charset_unit,
                "group"     : group_unit,                
            },            
            "text":{
                "text"      : text_unit,
                "character" : character_unit,
                "letter"    : letter_unit,
                "digit"     : digit_unit,
                "lowercase" : lowercase_unit,
                "uppercase" : uppercase_unit,
                "whitespace": whitespace_unit             
            },
            "repeat":{
                "1+"        : one_or_more_of_unit,
                "0+"        : zero_or_more_of_unit,
                "repeat"    : repeat_n_unit,
                "0 or 1 of" : zero_or_one_of_unit,                
            },
            "misc":{
                "or"        : one_of_unit,
                "range"     : range_unit,
                "backref"   : backref_unit
            },
            /*"lookaround":{
                "+ ahead" : null,
                "+ behind": null,
                "- ahead":null,
                "- behind":null
            }*/            
        }

        // option menu for what kind of item
        let option = document.createElement("option");
        option.innerHTML = "select";
        option.hidden = true;
        this.selectElem.appendChild(option);
        for (let group of Object.keys(this.mapping)){
            let groupElem = document.createElement("optgroup");
            groupElem.label = group;
            for (let item of Object.keys(this.mapping[group])){
                let option = document.createElement("option");
                option.value = [group,item];
                option.innerHTML = item;
                groupElem.appendChild(option);                
            }
            this.selectElem.appendChild(groupElem);
        }
    }
    assign(){
        let unit_type = this.selectElem.value.split(",");
        unit_type = this.mapping[unit_type[0]][unit_type[1]];
        if (!this.child){
            this.child = new unit_type(this);
            this.child.render();
            this.render();            
        }
        root.convert.bind(root)();
    }
    render(){
        // Renders a blank, if no child attached. Otherwise only renders the child.
        if (this.child != null){
            this.textElem.style.display = "none";
            this.selectElem.style.display = "none";
        }
        else{
            this.selectElem.value = "select";
            this.elem.style.display = "contents";
            this.selectElem.style.display = "inline-block";
            this.selectElem.className = "panel";
            this.selectElem.style.backgroundColor = this.color;
            this.selectElem.style.border = `4px solid ${this.borderColor}`;
        }
        this.elem.onchange = this.assign.bind(this);
        this.elem.oncontextmenu = this.showDeleteMenu.bind(this);
    }
    convert(){
        if (!this.deleted){
            if (this.child){
                return this.child.convert();
            }
            return "";            
        }
        return "";
    }
    showDeleteMenu(e){
        e.stopPropagation();
        e.preventDefault();
        deleteMenu.style.display = "block";
        deleteMenu.style.left = e.pageX+"px";
        deleteMenu.style.top = e.pageY+"px";
        deleteMenu.onclick = this.delete.bind(this);
    }
    delete(){
        if (!this.child){
            this.parent.elem.removeChild(this.elem);
            this.deleted = true;            
        }
        else{
            this.elem.removeChild(this.child.elem);
            this.child = null;
            this.render();
        }
        root.convert();
        deleteMenu.style.display = "none";
    }
}

class add_button{
    constructor(parent){
        this.parent = parent;
        this.elem = document.createElement("button");
        this.parent.elem.appendChild(this.elem);
        this.elem.onclick = this.add_blank.bind(this);
    }
    render(){
        this.elem.className = "plus";
        this.elem.innerHTML = "+";
    }
    add_blank(){
        this.parent.elem.removeChild(this.elem);
        let b = new blank_unit(this.parent);
        b.render();
        this.parent.add(b);
        this.parent.elem.appendChild(this.elem);
        root.convert.bind(root)();
    }
    convert(){
        return "";
    }
}

/* GROUPING */

class charset_unit extends unit{
    constructor(parent){
        super(parent,"charset","#E9C46A","#cca850");
        this.add(new blank_unit(this));
        this.add(new add_button(this));
    }
    convert(){
        if (!this.deleted){
            let s = "[";
            for (let c of this.children){
                s += c.convert();
            }
            s += "]";
            return s;       
        }
        return "";
    }
}

class group_unit extends unit{
    constructor(parent){
        super(parent,"group", "#2A9D8F", "#218074");
        this.add(new blank_unit(this));
        this.add(new add_button(this));
    }
    convert(){
        if (!this.deleted){
            let s = "(";
            for (let c of this.children){
                s += c.convert();
            }
            s += ")";
            return s;      
        }
        return "";
    }
}

/* TEXT */

class text_unit extends unit{
    constructor(parent){
        super(parent,"text","#f0f0f0","#c9c9c9");
        this.elem = document.createElement("div");
        this.parent.elem.appendChild(this.elem);
    }
    render(){
        this.elem.className = "panel";
        this.elem.style.backgroundColor = this.color;
        this.elem.style.border = `4px solid ${this.borderColor}`;
        this.elem.style.color = "black";
        this.elem.style.minWidth = "40px";
        this.elem.role = "textbox";
        this.elem.contentEditable = true;

        this.elem.onblur = root.convert.bind(root);
    }
    convert(){
        if (!this.deleted){
            let s = this.elem.innerHTML;
            let escapes = ["\\",".","(",")","[","]","+","*","|"]
            let parent_name = this.parent.parent.constructor.name
            if (parent_name == "root_unit"){
                for (let i of escapes){
                    s = s.replaceAll(i,"\\"+i);
                }
            }
            if (parent_name == "zero_or_more_of_unit"
            || parent_name == "one_or_more_of_unit"
            || parent_name == "zero_or_one_of_unit"
            || parent_name == "repeat_n_unit"){
                s = `(?:${s})`;
            }
            return s;   
        }
        return "";
    }
}

/* ALPHANUMERIC */

class character_unit extends unit{
    constructor(parent){
        super(parent, "character", "#f4a261", "#e8934f");
    }
    convert(){
        return ".";
    }
}

class letter_unit extends unit{
    constructor(parent){
        super(parent,"letter", "#f4a261", "#e8934f");
    }
    convert(){
        return "\\w";
    }
}

class uppercase_unit extends unit{
    constructor(parent){
        super(parent,"uppercase", "#f4a261", "#e8934f");
    }
    convert(){
        return "[A-Z]";
    }
}

class lowercase_unit extends unit{
    constructor(parent){
        super(parent,"lowercase", "#f4a261", "#e8934f");
    }
    convert(){
        return "[a-z]";
    }
}

class digit_unit extends unit{
    constructor(parent){
        super(parent,"digit", "#f4a261", "#e8934f");
    }
    convert(){
        return "\\d";
    }
}

class whitespace_unit extends unit{
    constructor(parent){
        super(parent,"whitespace", "#f4a261", "#e8934f");
    }
    convert(){
        return "\\s";
    }
}

/* MISC */
class one_of_unit extends unit{
    constructor(parent){
        super(parent,"one of", "#EF6F6C", "#db5653");
        this.add(new blank_unit(this));
        this.add(new blank_unit(this));
        this.add(new add_button(this));
    }
    convert(){
        if (!this.deleted){
            let s = "";
            for (let c of this.children){
                if (c.convert() != ""){
                    s += c.convert();
                    s += "|";                
                }
            }
            s = "(?:" + s.slice(0, s.length-1);
            s += ")";
            return s;            
        }
        return "";
    }
}

class backref_unit extends unit{
    constructor(parent){
        super(parent,"", "#A13D63", "#782343");   
    }
    render(){
        // First, create the element itself
        this.elem.className = "panel";
        this.elem.style.backgroundColor = this.color;
        this.elem.style.border = `4px solid ${this.borderColor}`;
        
        // add the text label and lower/upper bound inputs
        this.textElem.className = "label";
        let t = document.createElement("span");
        t.innerHTML = "content of group ";
        this.ref = document.createElement("input");
        this.ref.style.backgroundColor = "#de5488";
        this.ref.style.border = "4px solid #782343";

        this.textElem.appendChild(t);
        this.textElem.appendChild(this.ref);

        this.textElem.style.color = this.textColor;
    }
    convert(){
        return "\\"+this.ref.value;
    }
}

class range_unit extends unit{
    constructor(parent){
        super(parent,"", "#f4a261", "#e8934f");   
    }
    render(){
        // First, create the element itself
        this.elem.className = "panel";
        this.elem.style.backgroundColor = this.color;
        this.elem.style.border = `4px solid ${this.borderColor}`;
        
        // add the text label and lower/upper bound inputs
        this.textElem.className = "label";

        this.lowerBound = document.createElement("input");
        this.lowerBound.style.backgroundColor = "#f7c094";
        this.lowerBound.style.border = "solid 4px #e8934f";
        this.upperBound = document.createElement("input");
        this.upperBound.style.backgroundColor = "#f7c094";
        this.upperBound.style.border = "solid 4px #e8934f";

        let t = document.createElement("span");
        t.innerHTML = "from ";
        let t2 = document.createElement("span");
        t2.innerHTML = " to ";

        this.textElem.appendChild(t);
        this.textElem.appendChild(this.lowerBound);
        this.textElem.appendChild(t2);       
        this.textElem.appendChild(this.upperBound);

        this.textElem.style.color = this.textColor;
    }
    convert(){
        return `[${this.lowerBound.value}-${this.upperBound.value}]`;
    }
}

/* REPETITION */
class one_or_more_of_unit extends unit{
    constructor(parent){
        super(parent,"one or more of", "#e76f51", "#d45b3d");
        this.add(new blank_unit(this));
    }
    convert(){
        if (!this.deleted){
            let s = "";
            for (let c of this.children){
                s += c.convert();
            }
            s += "+";
            return s;
        }
        return "";
    }
}

class zero_or_more_of_unit extends unit{
    constructor(parent){
        super(parent,"zero or more of", "#e76f51", "#d45b3d");
        this.add(new blank_unit(this));
    }
    convert(){
        if (!this.deleted){
            let s = "";
            for (let c of this.children){
                s += c.convert();
            }
            s += "*";
            return s;
        }
        return "";
    }
}

class zero_or_one_of_unit extends unit{
    constructor(parent){
        super(parent,"0 or 1 copies of", "#e76f51", "#d45b3d");
        this.add(new blank_unit(this));
    }
    convert(){
        if (!this.deleted){
            let s = "";
            for (let c of this.children){
                s += c.convert();
            }
            s += "?";
            return s;
        }
        return "";
    }
}

class repeat_n_unit extends unit{
    constructor(parent){
        super(parent,"", "#e76f51", "#d45b3d");
        this.add(new blank_unit(this));
    }
    render(){
        // First, create the element itself
        this.elem.className = "panel";
        this.elem.style.backgroundColor = this.color;
        this.elem.style.border = `4px solid ${this.borderColor}`;
        
        // add the text label and lower/upper bound inputs
        this.textElem.className = "label";

        this.lowerBound = document.createElement("input");
        this.lowerBound.type = "number";
        this.lowerBound.style.backgroundColor = "#f28f77";
        this.lowerBound.style.border = "solid 4px #d45b3d";
        this.upperBound = document.createElement("input");
        this.upperBound.type = "number";
        this.upperBound.style.backgroundColor = "#f28f77";
        this.upperBound.style.border = "solid 4px #d45b3d";

        let t = document.createElement("span");
        t.innerHTML = " to ";
        let t2 = document.createElement("span");
        t2.innerHTML = " copies of";

        this.textElem.appendChild(this.lowerBound);
        this.textElem.appendChild(t);
        this.textElem.appendChild(this.upperBound);
        this.textElem.appendChild(t2);

        this.textElem.style.color = this.textColor;

        // add each of its children
        for (let child of this.children){
            child.render();
        }   
    }
    convert(){
        if (!this.deleted){
            let s = "";
            for (let c of this.children){
                s += c.convert();
            }
            s += `{${this.lowerBound.value},${this.upperBound.value}}`;
            return s;
        }
        return "";
    }
}

/* ROOT */

class root_unit{
    constructor(){
        this.elem = document.getElementById("blocks");
        this.children = [];
        this.add(new blank_unit(this));
        this.add(new add_button(this));
    }
    add(child){
        this.children.push(child);
    }
    render(){
        for (let child of this.children){
            child.render();
        }
    }
    convert(){
        let s = "";
        for (let child of this.children){
            s += child.convert();
        }
        document.getElementById("output").innerHTML = s;
    }
}

root = new root_unit();
root.render();

let deleteMenu = document.createElement("div");
document.body.appendChild(deleteMenu);
deleteMenu.className = "deleteMenu";
deleteMenu.innerHTML = "delete";
document.onclick = function(){
    deleteMenu.style.display = "none";
}
document.oncontextmenu = document.onclick;

document.getElementById("copybutton").onclick = function(){
    navigator.clipboard.writeText(document.getElementById("output").innerHTML);
}