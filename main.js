import {Categories} from "./js/Categories.js"
import {Node} from "./js/Node.js"
import {Graph} from "./js/Graph.js"

let poolArea = document.querySelector("#node-pool");
let graphArea = document.querySelector("#graph-view");

let graph = new Graph(graphArea);

// Populate pool
for(let [name, subcategory] of Object.entries(Categories)) {
    let div = document.createElement("div");
    div.classList.add("category");
    div.setAttribute("data-name", name);
    poolArea.appendChild(div);

    for(let [subname, items] of Object.entries(subcategory)) {
        let subdiv = document.createElement("div");
        subdiv.classList.add("subcategory");
        subdiv.setAttribute("data-name", subname);
        div.appendChild(subdiv);

        for(let item of items) {
            let node = new Node(item);
            subdiv.appendChild(node.element);
            node.setDraggable("new");
        }
    }
}

window.addEventListener("load", (event) => {
    graph.redraw();
})