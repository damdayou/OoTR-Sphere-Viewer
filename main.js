import {Categories} from "./js/Categories.js"
import {Node} from "./js/Node.js"

let pool = document.querySelector("#node-pool");
let graph = document.querySelector("#graph-view");

// Populate pool
for(let [name, subcategory] of Object.entries(Categories)) {
    let div = document.createElement("div");
    div.classList.add("category");
    div.setAttribute("data-name", name);
    pool.appendChild(div);

    for(let [subname, items] of Object.entries(subcategory)) {
        let subdiv = document.createElement("div");
        subdiv.classList.add("subcategory");
        subdiv.setAttribute("data-name", subname);
        div.appendChild(subdiv);

        for(let item of items) {
            let node = new Node(item);
            subdiv.appendChild(node.element);
        }
    }
}

